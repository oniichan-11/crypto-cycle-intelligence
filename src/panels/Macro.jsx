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
            <div style={{color:"#2E4060",fontSize:7,letterSpacing:2,marginBottom:6}}>KEYLESS (ECB / FRANKFURTER)</div>
            <div style={{fontSize:28,fontWeight:700,color:dxyKeyless?pCol(dxyKeyless-100,true):"#3D5070",fontFamily:"monospace"}}>{dxyKeyless?dxyKeyless.toFixed(2):"—"}</div>
            <div style={{marginTop:6}}><Badge label={dxyKeyless?"LIVE — NO KEY":"PENDING"}/></div>
          </div>
          <div>
            <div style={{color:"#2E4060",fontSize:7,letterSpacing:2,marginBottom:6}}>LIVE (COINAPI — OPTIONAL)</div>
            <div style={{fontSize:28,fontWeight:700,color:dxyLive?pCol(dxyLive-100,true):"#3D5070",fontFamily:"monospace"}}>{dxyLive?dxyLive.toFixed(2):"Add key →"}</div>
          </div>
          <div>
            <div style={{color:"#2E4060",fontSize:7,letterSpacing:2,marginBottom:6}}>DELAYED (FRED)</div>
            <div style={{fontSize:28,fontWeight:700,color:fredDXY?pCol(fredDXY-100,true):"#3D5070",fontFamily:"monospace"}}>{fredDXY?fredDXY.toFixed(2):"—"}</div>
          </div>
        </div>
        {Object.keys(forex).length>0&&<div style={{marginTop:12,display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>{DXY_BASKET.map(b=><div key={b.id} style={{background:"#080E1C",borderRadius:4,padding:"6px 8px"}}><div style={{color:"#2E4060",fontSize:7}}>{b.label}</div><div style={{color:"#9BB8D8",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{forex[b.id]?forex[b.id].toFixed(3):"—"}</div></div>)}</div>}
        <div style={{marginTop:10,padding:"6px 8px",background:"#080E1C",borderRadius:4,fontSize:7,color:"#2E4060",lineHeight:1.6}}>DXY now works out of the box via ECB data — no CoinAPI key required. Key adds real-time granularity.</div>
      </Card>
      <Card title="Macro — FRED (Free Key)" style={{marginBottom:10}}>
        <div style={{color:"#3D5070",fontSize:8,marginBottom:10}}>Register free at <span style={{color:"#F7931A"}}>fred.stlouisfed.org</span> → My Account → API Keys</div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input value={fredKey} onChange={e=>setFredKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchFRED()} placeholder="Paste FRED API key..." type="password" style={{background:"#080E1C",border:"1px solid #182035",borderRadius:4,color:"#9BB8D8",fontFamily:"monospace",fontSize:10,padding:"8px 12px",flex:1}}/>
          <button onClick={fetchFRED} disabled={fredBusy||!fredKey.trim()} style={{background:(!fredKey.trim()||fredBusy)?"#182035":"#F7931A",color:(!fredKey.trim()||fredBusy)?"#3D5070":"#060C18",border:"none",borderRadius:4,padding:"8px 16px",fontFamily:"monospace",fontSize:9,fontWeight:700,cursor:(!fredKey.trim()||fredBusy)?"default":"pointer"}}>{fredBusy?"...":"FETCH ↗"}</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {FRED_SERIES.map(s=>{const obs=fredData[s.key],loaded=obs&&obs.length>0;if(!loaded)return<div key={s.key} style={{background:"#080E1C",borderRadius:6,padding:"10px 12px",border:"1px solid #182035"}}><div style={{color:"#2E4060",fontSize:7,marginBottom:5}}>{s.label}</div><div style={{color:"#1A2840",fontSize:18,fontWeight:700}}>——</div></div>;const latest=parseFloat(obs[0].value),prev=obs[1]?parseFloat(obs[1].value):null,delta=prev!=null?latest-prev:null,isUp=delta!=null&&delta>0,bull=s.bullish==="rising"?isUp:s.bullish==="positive"?latest>0:s.bullish==="negative"?latest<0:!isUp,valStr=s.unit==="B"?fmtBig(latest*1e9):`${latest.toFixed(2)}${s.unit}`;return<div key={s.key} style={{background:"#080E1C",borderRadius:6,padding:"10px 12px",border:`1px solid ${bull?"#00C97A22":"#FF445522"}`}}><div style={{color:"#2E4060",fontSize:7,marginBottom:5}}>{s.label}</div><div style={{color:bull?"#00C97A":"#FF4455",fontSize:16,fontWeight:700,fontFamily:"monospace"}}>{valStr}</div>{delta!=null&&<div style={{color:bull?"#00C97A":"#FF4455",fontSize:8,marginTop:3}}>{isUp?"▲":"▼"} {Math.abs(delta).toFixed(s.unit==="B"?1:2)}{s.unit}</div>}<div style={{marginTop:5}}><Badge label={bull?"BULLISH":"BEARISH"}/></div></div>;})}
        </div>
      </Card>
    </>
  );
}
