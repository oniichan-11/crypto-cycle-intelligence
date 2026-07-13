import { FRED_BASE } from "../config/endpoints.js";
import { FRED_SERIES } from "../config/fredSeries.js";

// FRED macro series (free key) — returns { m2:[obs...], fed:[...], ... }.
export async function fetchFredSeries(fredKey) {
  if (!fredKey?.trim()) return null;
  const res = {};
  for (const s of FRED_SERIES) {
    try {
      const r = await fetch(`${FRED_BASE}?series_id=${s.id}&api_key=${fredKey.trim()}&file_type=json&sort_order=desc&limit=8`);
      if (r.ok) { const d = await r.json(); res[s.key] = (d.observations||[]).filter(o=>o.value!=="."); }
    } catch { /* skip series */ }
  }
  return res;
}
