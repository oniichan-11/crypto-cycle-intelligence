import { LLAMA, LLAMA_SC } from "../config/endpoints.js";
import { SECTOR_PROTOCOLS } from "../config/coins.js";

// Stablecoin supply trend — 7d Δ of total pegged USD supply.
export async function fetchStablecoinTrend() {
  try {
    const r = await fetch(`${LLAMA_SC}/stablecoincharts/all`);
    if (!r.ok) return null;
    const d = await r.json();
    if (!Array.isArray(d) || d.length <= 8) return null;
    const last = d[d.length-1], weekAgo = d[d.length-8];
    const scNow  = last.totalCirculatingUSD?.peggedUSD||last.totalCirculating?.peggedUSD||Object.values(last.totalCirculatingUSD||{}).reduce((a,b)=>a+b,0);
    const scPrev = weekAgo.totalCirculatingUSD?.peggedUSD||weekAgo.totalCirculating?.peggedUSD||Object.values(weekAgo.totalCirculatingUSD||{}).reduce((a,b)=>a+b,0);
    const scChg = (scNow&&scPrev)?((scNow-scPrev)/scPrev)*100:null;
    return { scChg, scNow, scPrev };
  } catch { return null; }
}

// Chain TVL + protocol TVL for tracked sectors.
export async function fetchDefiIntel() {
  try {
    const out = { chains:[], protocols:{} };
    const rc = await fetch(`${LLAMA}/v2/chains`);
    if (rc.ok) {
      const d = await rc.json();
      out.chains = (d||[]).filter(c=>["Ethereum","Solana","Arbitrum","Base","BSC","Avalanche","OP Mainnet"].includes(c.name)).map(c=>({name:c.name,tvl:c.tvl})).sort((a,b)=>b.tvl-a.tvl);
    }
    for (const [sec, slugs] of Object.entries(SECTOR_PROTOCOLS)) {
      out.protocols[sec] = [];
      for (const slug of slugs) {
        try {
          const rp = await fetch(`${LLAMA}/tvl/${slug}`);
          if (rp.ok) { const tvl = await rp.json(); out.protocols[sec].push({slug,tvl:typeof tvl==="number"?tvl:null}); }
        } catch { /* skip protocol */ }
      }
    }
    return out;
  } catch { return null; }
}
