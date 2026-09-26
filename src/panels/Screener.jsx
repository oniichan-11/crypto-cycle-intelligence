import { useState, useMemo } from "react";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import { fmtBig, fmtPct, pCol } from "../lib/math.js";
import { SCREENER } from "../config/screener.js";

const COLS = [
  { key:"name",         label:"PROTOCOL",       w:"170px" },
  { key:"category",     label:"CATEGORY",       w:"110px" },
  { key:"rev30d",       label:"REVENUE 30D",    w:"96px",  num:true },
  { key:"rev7d",        label:"REVENUE 7D",     w:"92px",  num:true },
  { key:"fees30d",      label:"FEES 30D",       w:"90px",  num:true },
  { key:"mcap",         label:"MCAP",           w:"90px",  num:true },
  { key:"mcapToRevAnn", label:"MCAP/REV(ANN)",  w:"100px", num:true },
  { key:"tvlChg7d",     label:"TVL Δ7D",        w:"76px",  num:true },
  { key:"chains",       label:"CHAINS",         w:"1fr" },
];

const chainLabel = k => k.length<=5 ? k.toUpperCase() : k.charAt(0).toUpperCase()+k.slice(1);

export default function Screener({ data, loading, onRefresh }) {
  const [sortKey, setSortKey] = useState("rev30d");
  const [sortDir, setSortDir] = useState(-1);

  const rows = useMemo(() => {
    const src = data?.rows || [];
    const sorted = [...src].sort((a,b) => {
      const av=a[sortKey], bv=b[sortKey];
      if (av==null && bv==null) return 0;
      if (av==null) return 1;
      if (bv==null) return -1;
      if (typeof av === "string") return sortDir * av.localeCompare(bv);
      return sortDir * (av - bv);
    });
    return sorted;
  }, [data, sortKey, sortDir]);

  const toggleSort = k => {
    if (k === sortKey) setSortDir(d=>-d);
    else { setSortKey(k); setSortDir(-1); }
  };

  return (
    <>
      <div style={{padding:"10px 14px",background:"#FFFFFF",borderRadius:8,border:"1px solid #E4E8F0",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <span style={{color:"#55606E",fontSize:12,lineHeight:1.7,maxWidth:640}}>
          <span style={{color:"#F7931A"}}>Screening for evidence, not picks.</span> Any size, any category — qualifies on DefiLlama-reported revenue ≥ {fmtBig(SCREENER.minRev7d)} over 7d <span style={{color:"#6B7686"}}>and</span> ≥ {fmtBig(SCREENER.minRev30d)} over 30d, so a single faded spike doesn't count. No market-cap filter — protocols with no token still qualify. No entry, exit, or valuation calls — see methodology below.
        </span>
        <button onClick={onRefresh} disabled={loading} style={{background:loading?"#E4E8F0":"#F7931A",color:loading?"#6B7484":"#F4F6FB",border:"none",borderRadius:8,padding:"7px 14px",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:loading?"default":"pointer",whiteSpace:"nowrap"}}>{loading?"SCANNING...":"RESCAN ↗"}</button>
      </div>

      {data?.stale && (
        <div style={{padding:"8px 12px",background:"#FDEEEE",border:"1px solid #E23A4E44",borderRadius:6,marginBottom:10,color:"#D9720F",fontSize:12}}>
          Showing cached results from {new Date(data.cachedAt).toLocaleString("en-US",{hour12:false})} — the live DefiLlama fetch failed on last attempt. Click RESCAN to retry.
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
        <Card title="Qualifying Protocols">
          <div style={{fontSize:26,fontWeight:700,color:"#F7931A",fontFamily:"inherit"}}>{data?.rows?.length ?? "—"}</div>
          <div style={{color:"#6B7686",fontSize:11,marginTop:4}}>{data?.matchedBeforeCap!=null?`of ${data.universeSize?.toLocaleString()} scanned`:"—"}</div>
        </Card>
        <Card title="Universe Scanned">
          <div style={{fontSize:26,fontWeight:700,color:"#171B24",fontFamily:"inherit"}}>{data?.universeSize?data.universeSize.toLocaleString():"—"}</div>
          <div style={{color:"#6B7686",fontSize:11,marginTop:4}}>DefiLlama-listed protocols, all categories</div>
        </Card>
        <Card title="Revenue Floor">
          <div style={{fontSize:18,fontWeight:700,color:"#17A257",fontFamily:"inherit"}}>{fmtBig(SCREENER.minRev7d)} / 7d</div>
          <div style={{color:"#6B7686",fontSize:11,marginTop:4}}>{fmtBig(SCREENER.minRev30d)} / 30d · config/screener.js</div>
        </Card>
        <Card title="Last Scan">
          <div style={{fontSize:18,fontWeight:700,color:"#171B24",fontFamily:"inherit"}}>{data?.cachedAt?new Date(data.cachedAt).toLocaleTimeString("en-US",{hour12:false}):"—"}</div>
          <div style={{color:"#6B7686",fontSize:11,marginTop:4}}>Cached 2h · manual rescan available</div>
        </Card>
      </div>

      <Card title={`Qualifying Protocols — sorted by ${COLS.find(c=>c.key===sortKey)?.label.toLowerCase()} (${sortDir>0?"asc":"desc"})`} style={{marginBottom:10}}>
        {!data ? (
          <div style={{color:"#6B7686",fontSize:13,padding:"24px 0",textAlign:"center"}}>Loading DefiLlama fee/revenue/TVL catalogs (a few MB, first load takes a moment)...</div>
        ) : rows.length===0 ? (
          <div style={{color:"#6B7686",fontSize:13,padding:"24px 0",textAlign:"center"}}>No protocols currently meet the revenue floors. Loosen them in config/screener.js if this stays empty.</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <div style={{minWidth:860}}>
              <div style={{display:"grid",gridTemplateColumns:COLS.map(c=>c.w).join(" "),gap:"0 8px",padding:"0 4px 6px",borderBottom:"1px solid #E4E8F0"}}>
                {COLS.map(c=>(
                  <button key={c.key} onClick={()=>toggleSort(c.key)} style={{background:"none",border:"none",padding:0,cursor:"pointer",textAlign:c.num?"right":"left",color:sortKey===c.key?"#F7931A":"#6B7686",fontSize:11,letterSpacing:1.5,fontFamily:"inherit",fontWeight:700}}>
                    {c.label}{sortKey===c.key?(sortDir>0?" ▲":" ▼"):""}
                  </button>
                ))}
              </div>
              {rows.map(r=>(
                <div key={r.slug} style={{display:"grid",gridTemplateColumns:COLS.map(c=>c.w).join(" "),gap:"0 8px",padding:"8px 4px",borderBottom:"1px solid #EDF0F5",alignItems:"center"}}>
                  <div style={{color:"#171B24",fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name} <span style={{color:"#6B7686",fontWeight:400}}>{r.symbol&&r.symbol!=="-"?r.symbol:""}</span></div>
                  <div style={{color:"#55606E",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.category}</div>
                  <div style={{textAlign:"right",color:"#17A257",fontSize:13,fontFamily:"inherit",fontWeight:700}}>{fmtBig(r.rev30d)}</div>
                  <div style={{textAlign:"right",color:"#2E9E5B",fontSize:13,fontFamily:"inherit"}}>{fmtBig(r.rev7d)}</div>
                  <div style={{textAlign:"right",color:"#626D7D",fontSize:13,fontFamily:"inherit"}}>{r.fees30d!=null?fmtBig(r.fees30d):"—"}</div>
                  <div style={{textAlign:"right",color:"#171B24",fontSize:13,fontFamily:"inherit"}}>{r.mcap!=null?fmtBig(r.mcap):"no token"}</div>
                  <div style={{textAlign:"right",color:"#626D7D",fontSize:13,fontFamily:"inherit"}}>{r.mcapToRevAnn!=null?`${r.mcapToRevAnn.toFixed(1)}×`:"—"}</div>
                  <div style={{textAlign:"right",color:pCol(r.tvlChg7d),fontSize:13,fontFamily:"inherit"}}>{fmtPct(r.tvlChg7d)}</div>
                  <div style={{color:"#6B7686",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.chains.slice(0,4).join(", ")}{r.chains.length>4?` +${r.chains.length-4}`:""}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="Revenue-Generating Chains — Top 15 by 30D App Fees">
          {!data?.chains?.length ? (
            <div style={{color:"#6B7686",fontSize:13,padding:"12px 0"}}>—</div>
          ) : (
            <div>
              {data.chains.map((c,i)=>(
                <div key={c.chain} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #EDF0F5"}}>
                  <span style={{color:"#55606E",fontSize:13}}><span style={{color:"#6B7686",fontFamily:"inherit",fontSize:12}}>{i+1}.</span> {chainLabel(c.chain)}</span>
                  <span style={{color:"#F7931A",fontSize:13,fontFamily:"inherit",fontWeight:700}}>{fmtBig(c.fees30d)}</span>
                </div>
              ))}
              <div style={{marginTop:8,padding:"6px 8px",background:"#F3F5F9",borderRadius:8,fontSize:11,color:"#6B7686",lineHeight:1.6}}>Aggregated from each protocol's real per-chain fee split (DefiLlama breakdown30d) — not double-counted across multi-chain deployments. No market-cap filter applies to chains.</div>
            </div>
          )}
        </Card>

        <Card title="Methodology & Honest Limits">
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <div style={{color:"#626D7D",fontSize:12,fontWeight:700,marginBottom:3}}>WHY REVENUE, NOT FEES</div>
              <div style={{color:"#55606E",fontSize:12,lineHeight:1.6}}>Fees = total paid by users. Revenue = the protocol/token's actual cut (always ≤ fees). Qualification runs on revenue specifically, at the user's request — fees are shown alongside for context only.</div>
            </div>
            <div>
              <div style={{color:"#626D7D",fontSize:12,fontWeight:700,marginBottom:3}}>NO MARKET-CAP FLOOR</div>
              <div style={{color:"#55606E",fontSize:12,lineHeight:1.6}}>Removed deliberately — protocols with no liquid token (lending markets, staking products) now qualify too. Their MCAP column reads "no token", not zero.</div>
            </div>
            <div>
              <div style={{color:"#626D7D",fontSize:12,fontWeight:700,marginBottom:3}}>NO 90D WINDOW</div>
              <div style={{color:"#55606E",fontSize:12,lineHeight:1.6}}>DefiLlama's free overview exposes 24h/7d/30d/1y only — no 90d bucket. We report what's real (7d, 30d) instead of approximating one.</div>
            </div>
            <div>
              <div style={{color:"#626D7D",fontSize:12,fontWeight:700,marginBottom:3}}>MCAP/REV(ANN.)</div>
              <div style={{color:"#55606E",fontSize:12,lineHeight:1.6}}>Market cap ÷ (30d revenue × 12) — a P/S-style multiple, only where a token exists. Lower = more revenue captured per dollar of market cap. Descriptive only, not a target or a signal to act on.</div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{padding:"10px 14px",background:"#FDEEEE",border:"1px solid #E23A4E44",borderRadius:8}}>
        <span style={{color:"#D9720F",fontSize:12,lineHeight:1.7}}><span style={{color:"#E23A4E",fontWeight:700}}>RESEARCH ONLY — NOT INVESTMENT ADVICE.</span> This screener surfaces protocols matching stated quantitative criteria. It is not a ranking of quality, safety, or expected return, and passing these filters is not a recommendation. Verify contracts, audits, and team information independently before acting on anything here.</span>
      </div>
    </>
  );
}
