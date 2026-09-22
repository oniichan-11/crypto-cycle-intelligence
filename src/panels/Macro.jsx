import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import { fmtBig, pCol } from "../lib/math.js";
import { DXY_BASKET } from "../lib/dxy.js";
import { FRED_SERIES } from "../config/fredSeries.js";

export default function Macro({dxyVal,dxyKeyless,dxyLive,fredDXY,forex,fredKey,setFredKey,fetchFRED,fredBusy,fredData}){
  return(
    <>
      <Card title="DXY — US Dollar Index (Now Keyless-Capable)" style={{marginBottom:10}} accent={dxyVal?pCol(dxyVal-100,true):undefined}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div>
            <div style={{color:"#6B7686",fontSize:11,letterSpacing:2,marginBottom:6}}>KEYLESS (ECB / FRANKFURTER)</div>
            <div style={{fontSize:30,fontWeight:700,color:dxyKeyless?pCol(dxyKeyless-100,true):"#6B7484",fontFamily:"inherit"}}>{dxyKeyless?dxyKeyless.toFixed(2):"—"}</div>
            <div style={{marginTop:6}}><Badge label={dxyKeyless?"LIVE — NO KEY":"PENDING"}/></div>
          </div>
          <div>
            <div style={{color:"#6B7686",fontSize:11,letterSpacing:2,marginBottom:6}}>LIVE (COINAPI — OPTIONAL)</div>
            <div style={{fontSize:30,fontWeight:700,color:dxyLive?pCol(dxyLive-100,true):"#6B7484",fontFamily:"inherit"}}>{dxyLive?dxyLive.toFixed(2):"Add key →"}</div>
          </div>
          <div>
            <div style={{color:"#6B7686",fontSize:11,letterSpacing:2,marginBottom:6}}>DELAYED (FRED)</div>
            <div style={{fontSize:30,fontWeight:700,color:fredDXY?pCol(fredDXY-100,true):"#6B7484",fontFamily:"inherit"}}>{fredDXY?fredDXY.toFixed(2):"—"}</div>
          </div>
        </div>
        {Object.keys(forex).length>0&&<div style={{marginTop:12,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>{DXY_BASKET.map(b=><div key={b.id} style={{background:"#F3F5F9",borderRadius:8,padding:"6px 8px"}}><div style={{color:"#6B7686",fontSize:11}}>{b.label}</div><div style={{color:"#171B24",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>{forex[b.id]?forex[b.id].toFixed(3):"—"}</div></div>)}</div>}
        <div style={{marginTop:10,padding:"6px 8px",background:"#F3F5F9",borderRadius:8,fontSize:11,color:"#6B7686",lineHeight:1.6}}>DXY now works out of the box via ECB data — no CoinAPI key required. Key adds real-time granularity.</div>
      </Card>
      <Card title="Macro — FRED (Free Key)" style={{marginBottom:10}}>
        <div style={{color:"#6B7484",fontSize:12,marginBottom:10}}>Register free at <span style={{color:"#B85E08",fontWeight:600}}>fred.stlouisfed.org</span> → My Account → API Keys</div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input value={fredKey} onChange={e=>setFredKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchFRED()} placeholder="Paste FRED API key..." type="password" style={{background:"#F3F5F9",border:"1px solid #E4E8F0",borderRadius:8,color:"#171B24",fontFamily:"inherit",fontSize:14,padding:"8px 12px",flex:1}}/>
          <button onClick={fetchFRED} disabled={fredBusy||!fredKey.trim()} style={{background:(!fredKey.trim()||fredBusy)?"#E4E8F0":"#F7931A",color:(!fredKey.trim()||fredBusy)?"#6B7484":"#F4F6FB",border:"none",borderRadius:8,padding:"8px 16px",fontFamily:"inherit",fontSize:13,fontWeight:700,cursor:(!fredKey.trim()||fredBusy)?"default":"pointer"}}>{fredBusy?"...":"FETCH ↗"}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {FRED_SERIES.map(s=>{const obs=fredData[s.key],loaded=obs&&obs.length>0;if(!loaded)return<div key={s.key} style={{background:"#F3F5F9",borderRadius:6,padding:"10px 12px",border:"1px solid #E4E8F0"}}><div style={{color:"#6B7686",fontSize:11,marginBottom:5}}>{s.label}</div><div style={{color:"#B4BAC6",fontSize:21,fontWeight:700}}>——</div></div>;const latest=parseFloat(obs[0].value),prev=obs[1]?parseFloat(obs[1].value):null,delta=prev!=null?latest-prev:null,isUp=delta!=null&&delta>0,bull=s.bullish==="rising"?isUp:s.bullish==="positive"?latest>0:s.bullish==="negative"?latest<0:!isUp,valStr=s.unit==="B"?fmtBig(latest*1e9):`${latest.toFixed(2)}${s.unit}`;return<div key={s.key} style={{background:"#F3F5F9",borderRadius:6,padding:"10px 12px",border:`1px solid ${bull?"#17A25722":"#E23A4E22"}`}}><div style={{color:"#6B7686",fontSize:11,marginBottom:5}}>{s.label}</div><div style={{color:bull?"#17A257":"#E23A4E",fontSize:19,fontWeight:700,fontFamily:"inherit"}}>{valStr}</div>{delta!=null&&<div style={{color:bull?"#17A257":"#E23A4E",fontSize:12,marginTop:3}}>{isUp?"▲":"▼"} {Math.abs(delta).toFixed(s.unit==="B"?1:2)}{s.unit}</div>}<div style={{marginTop:5}}><Badge label={bull?"BULLISH":"BEARISH"}/></div></div>;})}
        </div>
      </Card>
    </>
  );
}
