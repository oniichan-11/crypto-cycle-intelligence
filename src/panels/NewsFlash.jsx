import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import { fmtBig, fmtP, fmtPct, pCol } from "../lib/math.js";
import newsflash from "../data/newsflash.json";

const THEME_COL = {
  "Momentum / new ATH": "#17A257",
  "Ecosystem thesis": "#2E9E5B",
  "Bull thesis": "#2E9E5B",
  "Narrative / RH Chain ecosystem": "#2E9E5B",
  "Macro tangent": "#D9720F",
  "Chart setup": "#8A6100",
  "Bare mention": "#6B7484",
};
const cautionTheme = t => /treat with caution|unverified/i.test(t || "");

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = ms / 3600000;
  if (h < 1) return `${Math.round(ms/60000)}m ago`;
  if (h < 48) return `${Math.round(h)}h ago`;
  return `${Math.round(h/24)}d ago`;
}

// Cross-reference a ticker against data the dashboard already has live: the
// fixed sector watchlist (small, exact) and the revenue screener's broader
// universe (name/symbol match). This is the actual point of NewsFlash per the
// user's own framing — turning X chatter into "does the hard data corroborate
// any of this," not treating the chatter as a data point on its own.
function crossRef(ticker, sector, screenerRows) {
  const s = (sector || []).find(c => c.symbol?.toUpperCase() === ticker);
  if (s) return { kind: "sector", price: s.current_price, chg7d: s.price_change_percentage_7d_in_currency };
  const r = (screenerRows || []).find(row => row.symbol?.toUpperCase() === ticker);
  if (r) return { kind: "screener", rev30d: r.rev30d, mcap: r.mcap };
  return null;
}

export default function NewsFlash({ sector, screenerData }) {
  const entries = [...(newsflash.entries || [])].sort((a,b) => new Date(b.capturedAt) - new Date(a.capturedAt));

  return (
    <>
      <div style={{padding:"10px 14px",background:"#FFFFFF",borderRadius:8,border:"1px solid #E4E8F0",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <span style={{color:"#55606E",fontSize:12,lineHeight:1.7,maxWidth:660}}>
          Curated from <span style={{color:"#F7931A"}}>your</span> X list <a href={newsflash.listUrl} target="_blank" rel="noreferrer" style={{color:"#B85E08",fontWeight:600}}>{newsflash.listName}</a>. In your own words: <em>"signals, not dependable data points to act on — they can serve as confluences to help you have more conviction in protocols or chains."</em> Treat every entry here that way.
        </span>
        <Badge label={`CAPTURED ${timeAgo(newsflash.lastCapturedAt)}`} col="#8A93A3"/>
      </div>

      <div style={{padding:"10px 14px",background:"#F3F5F9",borderRadius:8,marginBottom:10,fontSize:12,color:"#55606E",lineHeight:1.7}}>
        This can't be a live per-visitor feed — the public dashboard has no access to your X login, only your own browser does. So this panel reads from a snapshot file, refreshed on a schedule when Claude checks your list and writes what it finds. Freshness = the "captured" timestamp above, not real-time.
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {entries.length === 0 ? (
          <Card><div style={{color:"#6B7686",fontSize:13,padding:"12px 0",textAlign:"center"}}>No captures yet.</div></Card>
        ) : entries.map(e => {
          const caution = cautionTheme(e.theme);
          const themeCol = caution ? "#D9720F" : (THEME_COL[e.theme] || "#6B7484");
          return (
            <Card key={e.id} accent={themeCol}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:8}}>
                <div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    {e.tickers.map(t => <span key={t} style={{background:"#F7931A18",color:"#B85E08",padding:"2px 8px",borderRadius:20,fontSize:12,fontWeight:700}}>${t}</span>)}
                    <span style={{color:themeCol,fontSize:12,fontWeight:600}}>{e.theme}</span>
                  </div>
                </div>
                <span style={{color:"#8A93A3",fontSize:11,whiteSpace:"nowrap"}}>{timeAgo(e.capturedAt)}</span>
              </div>
              <div style={{color:"#171B24",fontSize:13,lineHeight:1.65,marginBottom:10}}>{e.summary}</div>

              {e.tickers.map(t => {
                const ref = crossRef(t, sector, screenerData?.rows);
                if (!ref) return null;
                return (
                  <div key={t} style={{display:"inline-flex",alignItems:"center",gap:6,background:"#EEFBF3",border:"1px solid #17A25733",borderRadius:8,padding:"4px 10px",fontSize:11,color:"#17A257",marginRight:8,marginBottom:8}}>
                    ✓ ${t} is live-tracked in {ref.kind === "sector" ? "Sectors/DeFi" : "the Screener"}
                    {ref.kind === "sector" && <span style={{color:pCol(ref.chg7d)}}> · {fmtP(ref.price)} ({fmtPct(ref.chg7d)} 7d)</span>}
                    {ref.kind === "screener" && <span> · {fmtBig(ref.rev30d)} rev/30d, mcap {ref.mcap!=null?fmtBig(ref.mcap):"no token"}</span>}
                  </div>
                );
              })}

              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:4}}>
                {e.sources.map(s => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" style={{color:"#6B7686",fontSize:11,textDecoration:"none",borderBottom:"1px solid #E4E8F0"}}>{s.handle} ↗</a>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{marginTop:10,padding:"10px 14px",background:"#FDEEEE",border:"1px solid #E23A4E44",borderRadius:8}}>
        <span style={{color:"#D9720F",fontSize:12,lineHeight:1.7}}><span style={{color:"#E23A4E",fontWeight:700}}>SIGNAL, NOT DATA.</span> Everything above is unverified social-media commentary from accounts on your own curated list. It is not fact-checked, not audited, and several entries are flagged where a claim was made with no stated methodology. Use it as one input among many — never as a standalone reason to act.</span>
      </div>
    </>
  );
}
