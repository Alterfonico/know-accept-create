/**
 * backfill-embeddings — one-time / on-demand embedding backfill
 *
 * Fetches all thoughts where embedding IS NULL, calls text-embedding-3-small
 * in batches of 20, and updates each row in place.
 *
 * POST /functions/v1/backfill-embeddings
 * Headers: Authorization: Bearer <supabase_service_role_key>
 *
 * Response 200: { total, processed, failed }
 *
 * Safe to call multiple times — only touches null-embedding rows.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL             = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENROUTER_API_KEY       = Deno.env.get("OPENROUTER_API_KEY")!;

const OPENROUTER_BASE  = "https://openrouter.ai/api/v1";
const EMBEDDING_MODEL  = "openai/text-embedding-3-small";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// OpenRouter requires single-string input — no array batching
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

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const { data: rows, error: fetchError } = await supabase
    .from("thoughts")
    .select("id, content")
    .is("embedding", null)
    .order("created_at", { ascending: true });

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return new Response(
      JSON.stringify({ total: 0, processed: 0, failed: 0, message: "Nothing to backfill" }),
      { status: 200 }
    );
  }

  let processed = 0;
  let failed = 0;

  for (const row of rows) {
    if (!row.content?.trim()) { failed++; continue; }

    const embedding = await embedOne(row.content);
    if (!embedding) { failed++; continue; }

    const { error } = await supabase
      .from("thoughts")
      .update({ embedding })
      .eq("id", row.id);

    if (error) {
      console.error(`Update failed ${row.id}:`, error);
      failed++;
    } else {
      processed++;
    }
  }

  return new Response(
    JSON.stringify({ total: rows.length, processed, failed }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
