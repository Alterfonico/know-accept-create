/**
 * capture-echo — Meverse production ingestion endpoint
 *
 * Receives a text echo from any capture surface (Android, Mac, app),
 * classifies voltage (HI / LO / FLAT), generates an analysis and
 * embedding in parallel, stores the echo, and returns the classification
 * immediately so the caller can drive the wave / wall UX.
 *
 * POST /functions/v1/capture-echo
 * Headers: Authorization: Bearer <supabase_anon_key>
 * Body:    { "text": string, "source"?: string }
 *
 * Response 200: { id, voltage, confidence, analysis }
 * Response 400: { error: "text is required" }
 * Response 500: { error: string } — echo is still stored if DB write succeeded
 *
 * Failure contract (ADR-004):
 *   - Classifier failure  → stored with voltage: null, confidence: null, analysis: null
 *   - Embedding failure   → stored with embedding: null (backfill later)
 *   - DB failure          → 500, nothing stored
 *   - An echo is NEVER silently lost.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL            = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENROUTER_API_KEY      = Deno.env.get("OPENROUTER_API_KEY")!;

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const CLASSIFIER_MODEL = "openai/gpt-4o-mini";
const EMBEDDING_MODEL  = "openai/text-embedding-3-small";
const CONFIDENCE_THRESHOLD = 0.60; // below this → voltage stored as null

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ── Trinary voltage classifier ────────────────────────────────────────────────
//
// Returns one of three states defined in ADR-002 (Layer 2 / UX altitude):
//   HI   — alive, present, charged          (integer 1 / LIFE)
//   LO   — depleted, eroded, under pressure (integer 2 / UPSET)
//   FLAT — showed up, no clear state         (integer 0 / POKE)
//
// Also returns a brief analysis: 2–3 precise observations.
// Tone: clinical witness, not therapist. Describe what is there, not what to do.
// The system reads. The user witnesses.

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

Examples of good analysis:
  "Structural fatigue. Not rest deficit — meaning deficit. The two look identical from inside."
  "Presence without content. That's contact. The system registered you were here."
  "The surprise in 'forgot that was possible' is the signal. The baseline shifted somewhere."

Respond with valid JSON only. No markdown, no extra text.`;

type ClassifierResult = {
  voltage: "HI" | "LO" | "FLAT";
  confidence: number;
  analysis: string;
};

async function classifyVoltage(text: string): Promise<ClassifierResult | null> {
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
        temperature: 0.3, // low temp for consistent classification
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

    // Validate response shape
    if (!["HI", "LO", "FLAT"].includes(parsed.voltage)) return null;
    if (typeof parsed.confidence !== "number") return null;
    if (typeof parsed.analysis !== "string") return null;

    return parsed;
  } catch (err) {
    console.error("Classifier error:", err);
    return null;
  }
}

// ── Embedding ─────────────────────────────────────────────────────────────────

async function getEmbedding(text: string): Promise<number[] | null> {
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
    console.error("Embedding error:", err);
    return null;
  }
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS pre-flight (for browser clients / local dev)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  let body: { text?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return new Response(JSON.stringify({ error: "text is required" }), { status: 400 });
  }

  const source = body.source ?? "unknown";
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Run classifier and embedding in parallel — neither blocks the other
  const [classification, embedding] = await Promise.all([
    classifyVoltage(text),
    getEmbedding(text),
  ]);

  // Apply confidence threshold: low-confidence results stored as null
  const voltage = (classification && classification.confidence >= CONFIDENCE_THRESHOLD)
    ? classification.voltage
    : null;
  const confidence = classification?.confidence ?? null;
  const analysis   = (voltage !== null) ? (classification?.analysis ?? null) : null;

  // Always store the echo — classifier failure never loses an entry (ADR-004)
  const { data, error } = await supabase
    .from("thoughts")
    .insert({
      content:   text,
      embedding: embedding,   // null if embedding failed — backfillable
      metadata: {
        source,
        word_count: wordCount,
        voltage,              // "HI" | "LO" | "FLAT" | null
        confidence,           // float | null
        analysis,             // string | null
      },
    })
    .select("id")
    .single();

  if (error) {
    console.error("DB insert error:", error);
    return new Response(
      JSON.stringify({ error: `Failed to store echo: ${error.message}` }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ id: data.id, voltage, confidence, analysis }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
});
