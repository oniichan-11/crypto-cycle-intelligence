import { FG_URL } from "../config/endpoints.js";

export async function fetchFearGreed() {
  try {
    const r = await fetch(FG_URL);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.data || null;
  } catch { return null; }
}
