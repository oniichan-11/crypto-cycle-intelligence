import { CM } from "../config/endpoints.js";
import { mean, stdDev, movAvg } from "../lib/math.js";

// NOTE (verified live 2026-07-12): CoinMetrics v4 rejects sort=asc/desc — direction
// comes from paging_from=start|end, and rows always arrive in ascending time order.
// CapRealUSD, SOPR and SplyAct* are no longer in the free community tier (403), so
// realized cap & NUPL are derived from CapMVRVCur (still free):
//   realCap = mktCap / MVRV,  NUPL = 1 − 1/MVRV,  MVRV-Z = (mkt − real) / σ(mkt)
// σ is computed over the FULL history since 2018 (~7yr), never a fixed window.
export async function fetchOnChain() {
  try {
    const r = await fetch(`${CM}/timeseries/asset-metrics?assets=btc&metrics=CapMrktCurUSD,CapMVRVCur&frequency=1d&page_size=10000&start_time=2018-01-01&paging_from=start`);
    if (!r.ok) return null;
    const d = await r.json();
    const rows = (d.data||[]).map(x=>({date:x.time?.slice(0,10),mkt:parseFloat(x.CapMrktCurUSD)||null,mvrv:parseFloat(x.CapMVRVCur)||null})).filter(x=>x.mkt&&x.mvrv);
    if (rows.length <= 30) return null;
    const mkts = rows.map(x=>x.mkt);
    const mktStd = stdDev(mkts);
    const cur = rows[rows.length-1];
    const real = cur.mkt/cur.mvrv;
    const mvrv = cur.mvrv;
    const mvrvZ = (cur.mkt-real)/mktStd;
    const nupl = 1-1/cur.mvrv;
    const series = rows.slice(-90).map(x=>({date:x.date,mvrvZ:(x.mkt-x.mkt/x.mvrv)/mktStd,nupl:1-1/x.mvrv}));
    return {mvrv,mvrvZ,nupl,sopr:null,realCap:real,mktCap:cur.mkt,series,nRows:rows.length,yrs:(rows.length/365).toFixed(1)};
  } catch { return null; }
}

// Hash rate → ribbons (30d vs 60d MA). paging_from=end → last 90 rows, ascending.
export async function fetchHashRibbons() {
  try {
    const r = await fetch(`${CM}/timeseries/asset-metrics?assets=btc&metrics=HashRate&frequency=1d&page_size=90&paging_from=end`);
    if (!r.ok) return null;
    const d = await r.json();
    const vals = (d.data||[]).map(x=>parseFloat(x.HashRate)).filter(Boolean);
    if (vals.length <= 60) return null;
    const ma30 = movAvg(vals,30), ma60 = movAvg(vals,60);
    const series = vals.map((v,i)=>({i,ma30:ma30[i]!=null?+(ma30[i]/1e18).toFixed(2):null,ma60:ma60[i]!=null?+(ma60[i]/1e18).toFixed(2):null}));
    return {l30:ma30[ma30.length-1],l60:ma60[ma60.length-1],series};
  } catch { return null; }
}

// TRUE exchange netflow (upgraded 2026-07-12): FlowInExNtv/FlowOutExNtv/SplyExNtv
// are now on the free community tier — this replaces the old SplyAct1yr proxy with
// the real thing the handoff assumed needed Glassnode/CryptoQuant.
export async function fetchExchangeFlows() {
  try {
    const r = await fetch(`${CM}/timeseries/asset-metrics?assets=btc&metrics=FlowInExNtv,FlowOutExNtv,SplyExNtv&frequency=1d&page_size=8&paging_from=end`);
    if (!r.ok) return null;
    const d = await r.json();
    const rows = (d.data||[]).map(x=>({inF:parseFloat(x.FlowInExNtv),outF:parseFloat(x.FlowOutExNtv),bal:parseFloat(x.SplyExNtv)})).filter(x=>!isNaN(x.bal));
    if (rows.length < 2) return null;
    const nets = rows.map(x=>(x.inF||0)-(x.outF||0));
    const flowNet = mean(nets);                                    // 7d mean net flow, BTC/day (+ = to exchanges)
    const balNow = rows[rows.length-1].bal, balPrev = rows[0].bal;
    const balChg = balPrev?((balNow-balPrev)/balPrev)*100:null;    // 7d % change in exchange balance
    return { flowNet, balChg, balNow };
  } catch { return null; }
}

// Full daily BTC price history since 2016 (PriceUSD is free) — feeds the cycle
// backtesting overlay. ~3,800 rows that change once per day, so cached 12h in
// localStorage rather than refetched on the 120s loop.
export async function fetchPriceHistory() {
  const KEY = "cm_price_hist_v1", MAX_AGE = 12 * 3600000;
  try {
    const c = JSON.parse(localStorage.getItem(KEY));
    if (c && Date.now() - c.ts < MAX_AGE) return c.v;
  } catch { /* ignore */ }
  try {
    const r = await fetch(`${CM}/timeseries/asset-metrics?assets=btc&metrics=PriceUSD&frequency=1d&page_size=10000&start_time=2016-01-01&paging_from=start`);
    if (!r.ok) return null;
    const d = await r.json();
    const rows = (d.data||[]).map(x=>({date:x.time?.slice(0,10),p:parseFloat(x.PriceUSD)})).filter(x=>x.date&&!isNaN(x.p));
    if (rows.length < 500) return null;
    try { localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), v: rows })); } catch { /* quota — serve uncached */ }
    return rows;
  } catch { return null; }
}

// New Address Growth proxy (handoff §9.3) — 30d MA of active addresses vs the
// prior 30d window. AdrActCnt is still free on the community tier.
export async function fetchAddressActivity() {
  try {
    const r = await fetch(`${CM}/timeseries/asset-metrics?assets=btc&metrics=AdrActCnt&frequency=1d&page_size=90&paging_from=end`);
    if (!r.ok) return null;
    const d = await r.json();
    const vals = (d.data||[]).map(x=>parseFloat(x.AdrActCnt)).filter(Boolean);
    if (vals.length < 60) return null;
    const cur30 = mean(vals.slice(-30));
    const prev30 = mean(vals.slice(-60,-30));
    return { cur30, prev30, growth: prev30?((cur30-prev30)/prev30)*100:null };
  } catch { return null; }
}
