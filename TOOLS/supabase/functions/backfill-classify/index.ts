/**
 * backfill-classify — on-demand trinary voltage classification
 *
 * Fetches all thoughts where trinary_state IS NULL and content is non-empty,
 * runs the same classifier prompt as capture-echo, and updates each row.
 *
 * POST /functions/v1/backfill-classify
 * Headers: Authorization: Bearer <supabase_service_role_key>
 * Body:    { "limit"?: number }   — optional cap (default: all)
 *
 * Response 200: { total, classified, skipped, failed }
 *
 * Safe to call multiple times — only touches null-voltage rows.
 * Also backfills embeddings on rows that have none (piggyback).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL             = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENROUTER_API_KEY       = Deno.env.get("OPENROUTER_API_KEY")!;

const OPENROUTER_BASE    = "https://openrouter.ai/api/v1";
const CLASSIFIER_MODEL   = "openai/gpt-4o-mini";
const EMBEDDING_MODEL    = "openai/text-embedding-3-small";
const CONFIDENCE_THRESHOLD = 0.60;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Voltage mapping (same as capture-echo) ──────────────────────────────────
const VOLTAGE_TO_INT: Record<string, number> = { FLAT: 0, HI: 1, LO: 2 };

// ── Classifier prompt (identical to capture-echo) ───────────────────────────
const CLASSIFIER_SYSTEM = `You are a signal classifier for a personal capture system.
The user logs raw thoughts and feelings. Your job is to read the signal, not interpret it.

Classify the text into exactly one of three voltage states:
  HI   — alive, present, charged, something is moving or mattering
  LO   — depleted, eroding, under pressure, something is heavy or stuck
  FLAT — showed up, presence without charge, neither clearly HI nor LO

Return a JSON object with exactly these fields:
{
  "voltage": "HI" | "LO" | "FLAT",
  "confidence": <float 0.0–1.0>,
  "analysis": "<2–3 sentences>"
}

Rules for analysis:
- Describe what is present in the text, not what the person should do.
- Use precise, economical language. No encouragement. No advice.
- First sentence names what is there. Second (and optional third) goes one layer deeper.
- Write as if you are a witness, not a counselor.
- Do not use the word "you" more than once per sentence.
- If the text is minimal (one word, an emoji, a single short phrase), reflect that brevity — do not over-read.

Respond with valid JSON only. No markdown, no extra text.`;

type ClassifierResult = {
  voltage: "HI" | "LO" | "FLAT";
  confidence: number;
  analysis: string;
};

async function classifyOne(text: string): Promise<ClassifierResult | null> {
  try {
    const r = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CLASSIFIER_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          { role: "system", content: CLASSIFIER_SYSTEM },
          { role: "user", content: text },
        ],
      }),
    });

    if (!r.ok) {
      console.error(`Classifier HTTP ${r.status}: ${await r.text()}`);
      return null;
    }

    const d = await r.json();
    const raw = d.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ClassifierResult;
    if (!["HI", "LO", "FLAT"].includes(parsed.voltage)) return null;
    if (typeof parsed.confidence !== "number") return null;
    if (typeof parsed.analysis !== "string") return null;

    return parsed;
  } catch (err) {
    console.error("Classifier error:", err);
    return null;
  }
}

async function embedOne(text: string): Promise<number[] | null> {
  try {
    const r = await fetch(`${OPENROUTER_BASE}/embeddings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
    });

    if (!r.ok) {
      console.error(`Embedding HTTP ${r.status}: ${await r.text()}`);
      return null;
    }

    const d = await r.json();
    return d.data?.[0]?.embedding ?? null;
  } catch (err) {
    console.error("Embed error:", err);
    return null;
  }
}

// ── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  let limit = 0;
  try {
    const body = await req.json();
    limit = body.limit ?? 0;
  } catch { /* no body is fine — process all */ }

  // Fetch rows needing classification — include existing metadata so we can merge
  let query = supabase
    .from("thoughts")
    .select("id, content, embedding, metadata")
    .is("trinary_state", null)
    .order("created_at", { ascending: true });

  if (limit > 0) query = query.limit(limit);

  const { data: rows, error: fetchError } = await query;

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return new Response(
      JSON.stringify({ total: 0, classified: 0, skipped: 0, failed: 0, message: "Nothing to backfill" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  let classified = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    if (!row.content?.trim()) { skipped++; continue; }

    const result = await classifyOne(row.content);
    if (!result) { failed++; continue; }

    const voltage = result.confidence >= CONFIDENCE_THRESHOLD ? result.voltage : null;
    const trinaryState = voltage !== null ? VOLTAGE_TO_INT[voltage] : null;

    // Merge classification into existing metadata — never overwrite legacy fields
    const existingMeta = (row.metadata as Record<string, unknown>) ?? {};
    const mergedMeta = {
      ...existingMeta,
      confidence: result.confidence,
      analysis: result.analysis,
      backfill_classified: true,
    };

    const update: Record<string, unknown> = {
      trinary_state: trinaryState,
      state_source: voltage !== null ? "inferred" : null,
      metadata: mergedMeta,
    };

    // Piggyback: if embedding is also null, fill it
    if (!row.embedding) {
      const embedding = await embedOne(row.content);
      if (embedding) update.embedding = embedding;
    }

    const { error } = await supabase
      .from("thoughts")
      .update(update)
      .eq("id", row.id);

    if (error) {
      console.error(`Update failed ${row.id}:`, error);
      failed++;
    } else {
      classified++;
    }
  }

  return new Response(
    JSON.stringify({ total: rows.length, classified, skipped, failed }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
