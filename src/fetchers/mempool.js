import { MEMPOOL } from "../config/endpoints.js";

export async function fetchDifficulty() {
  try {
    const r = await fetch(`${MEMPOOL}/v1/difficulty-adjustment`);
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
