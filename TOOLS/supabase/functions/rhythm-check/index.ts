/**
 * rhythm-check — read voltage trend over last 12h, decide entry signal
 *
 * GET /functions/v1/rhythm-check
 * Headers: Authorization: Bearer <supabase_anon_key>
 *
 * Response 200: {
 *   "entry_signal": "YES" | "NO" | "UNSTABLE" | "INSUFFICIENT_DATA",
 *   "voltage_breakdown": { "HI": number, "LO": number, "FLAT": number },
 *   "thought_count": number,
 *   "window_hours": 12,
 *   "trend": string,
 *   "recommendation": string,
 *   "raw_data": [{ trinary_state, count, pct }]
 * }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type VoltageMap = { [key: string]: number };

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "GET only" }), { status: 405 });
  }

  try {
    // Query: voltage distribution last 12h
    const { data, error } = await supabase
      .from("thoughts")
      .select("trinary_state")
      .gt("created_at", new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());

    if (error) {
      return new Response(
        JSON.stringify({ error: `Supabase query failed: ${error.message}` }),
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({
          entry_signal: "INSUFFICIENT_DATA",
          voltage_breakdown: { HI: 0, LO: 0, FLAT: 0 },
          thought_count: 0,
          window_hours: 12,
          trend: "No thoughts captured in last 12h",
          recommendation: "Capture 3+ thoughts to establish rhythm signal",
          raw_data: [],
        }),
        { status: 200 }
      );
    }

    // Count voltage distribution
    const voltageMap: VoltageMap = { "1": 0, "2": 0, "0": 0 };
    data.forEach((row: { trinary_state: number | null }) => {
      if (row.trinary_state !== null) {
        voltageMap[String(row.trinary_state)]++;
      }
    });

    const total = Object.values(voltageMap).reduce((a, b) => a + b, 0);
    if (total === 0) {
      return new Response(
        JSON.stringify({
          entry_signal: "INSUFFICIENT_DATA",
          voltage_breakdown: { HI: 0, LO: 0, FLAT: 0 },
          thought_count: data.length,
          window_hours: 12,
          trend: "All thoughts are null voltage (classifier failures)",
          recommendation: "Capture clear thoughts to establish rhythm",
          raw_data: [],
        }),
        { status: 200 }
      );
    }

    const hiPct = (voltageMap["1"] / total) * 100;
    const loPct = (voltageMap["2"] / total) * 100;
    const flatPct = (voltageMap["0"] / total) * 100;

    // Determine entry signal & recommendation
    let entrySignal: "YES" | "NO" | "UNSTABLE";
    let trend: string;
    let recommendation: string;

    if (hiPct >= 50) {
      entrySignal = "YES";
      trend = `Strong HI signal (${hiPct.toFixed(0)}% HI)`;
      recommendation = "Enter now. You're in rhythm.";
    } else if (loPct >= 60) {
      entrySignal = "NO";
      trend = `High LO signal (${loPct.toFixed(0)}% LO)`;
      recommendation = "Take a break. You're depleted.";
    } else if (flatPct >= 70) {
      entrySignal = "NO";
      trend = `Neutral signal (${flatPct.toFixed(0)}% FLAT)`;
      recommendation = "Wait. No clear direction. Capture more to establish rhythm.";
    } else if (hiPct >= 30 && flatPct >= 20) {
      entrySignal = "YES";
      trend = `Building momentum (${hiPct.toFixed(0)}% HI + ${flatPct.toFixed(0)}% FLAT)`;
      recommendation = "Enter. Conditions are favorable.";
    } else if (hiPct < 30 && loPct >= 50) {
      entrySignal = "NO";
      trend = `Low energy (${loPct.toFixed(0)}% LO, ${hiPct.toFixed(0)}% HI)`;
      recommendation = "Rest. Energy is depleted.";
    } else if (hiPct > 80 || loPct > 80) {
      entrySignal = "UNSTABLE";
      trend = `Brittle rhythm (${hiPct > 80 ? "all HI" : "all LO"})`;
      recommendation = "Enter cautiously. No diversity in your state. Watch for burnout.";
    } else {
      entrySignal = "YES";
      trend = `Balanced signal (${hiPct.toFixed(0)}% HI, ${loPct.toFixed(0)}% LO, ${flatPct.toFixed(0)}% FLAT)`;
      recommendation = "Conditions are okay. You can enter.";
    }

    return new Response(
      JSON.stringify({
        entry_signal: entrySignal,
        voltage_breakdown: {
          HI: Math.round(hiPct),
          LO: Math.round(loPct),
          FLAT: Math.round(flatPct),
        },
        thought_count: total,
        window_hours: 12,
        trend,
        recommendation,
        raw_data: [
          { trinary_state: 1, count: voltageMap["1"], pct: Math.round(hiPct) },
          { trinary_state: 2, count: voltageMap["2"], pct: Math.round(loPct) },
          { trinary_state: 0, count: voltageMap["0"], pct: Math.round(flatPct) },
        ],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Server error: ${String(err)}` }),
      { status: 500 }
    );
  }
});
