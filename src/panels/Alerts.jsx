import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import { ALERT_RULES } from "../lib/alerts.js";

const SEV_COL = { info: "#2E9E5B", warning: "#D9720F", critical: "#E23A4E" };

export default function Alerts({ alerts, onClear }) {
  return (
    <>
      <div style={{padding:"8px 12px",background:"#FFFFFF",borderRadius:6,border:"1px solid #E4E8F0",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <span style={{color:"#55606E",fontSize:12}}>
          <span style={{color:"#F7931A"}}>{ALERT_RULES.length} threshold rules</span> armed — evaluated every 120s refresh against the previous snapshot (persisted across sessions). Fires only on signal <span style={{color:"#171B24"}}>crosses</span>, never on level.
        </span>
        {alerts.length>0&&<button onClick={onClear} style={{background:"#E4E8F0",color:"#55606E",border:"1px solid #6B7686",borderRadius:8,padding:"4px 10px",fontSize:12,fontFamily:"inherit",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>CLEAR LOG</button>}
      </div>
      <Card title={`Alert Log — ${alerts.length} Triggered`}>
        {alerts.length===0?(
          <div style={{color:"#6B7686",fontSize:13,padding:"24px 0",textAlign:"center"}}>
            No alerts triggered yet. Alerts fire when a signal crosses a doctrine threshold —<br/>
            MVRV-Z crossing 0 / 3 / 7, NUPL entering Euphoria, SOPR losing 1.0, funding extremes,<br/>
            netflow flips, hash-ribbon crosses, F&G extremes, or a cycle-verdict phase change.
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column"}}>
            {alerts.map((a,i)=>(
              <div key={`${a.id}-${a.ts}-${i}`} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"8px 4px",borderBottom:"1px solid #EDF0F5"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:SEV_COL[a.sev]||"#6B7484",marginTop:4,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{color:"#171B24",fontSize:13,lineHeight:1.5}}>{a.msg}</div>
                  <div style={{color:"#6B7686",fontSize:11,marginTop:2}}>{new Date(a.ts).toLocaleString("en-US",{hour12:false})} · rule: {a.id}</div>
                </div>
                <Badge label={a.sev.toUpperCase()}/>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="Armed Rules" style={{marginTop:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
          {ALERT_RULES.map(r=>(
            <div key={r.id} style={{display:"flex",gap:10,padding:"5px 0",borderBottom:"1px solid #EDF0F5",alignItems:"center"}}>
              <Badge label={r.sev.toUpperCase()}/>
              <span style={{color:"#626D7D",fontSize:12,fontFamily:"inherit"}}>{r.id}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
