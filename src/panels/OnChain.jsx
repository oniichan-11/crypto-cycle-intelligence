import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import StatRow from "../components/StatRow.jsx";
import MiniBar from "../components/MiniBar.jsx";

export default function OnChain({onChain,hashD,mz,nz,sz,hrInfo,sopr,puell,pz,addr,az}){
  return(
    <>
      <div style={{padding:"8px 12px",background:"#0C1525",borderRadius:6,border:"1px solid #182035",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#00C97A",flexShrink:0}}/>
        <span style={{color:"#526880",fontSize:8}}>Sources: <span style={{color:"#00C97A"}}>CoinMetrics Community</span> (MVRV, market cap — realized cap & NUPL derived from the free MVRV ratio) + <span style={{color:"#00C97A"}}>BGeometrics</span> (SOPR, Puell). MVRV-Z σ from <span style={{color:"#9BB8D8"}}>{onChain?.yrs||"—"} years</span> ({onChain?.nRows||"—"} days) of history.</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="MVRV-Z Score — Tier 1" accent={mz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div><div style={{fontSize:32,fontWeight:700,color:mz.col,fontFamily:"monospace"}}>{onChain?.mvrvZ!=null?onChain.mvrvZ.toFixed(2):"—"}</div><div style={{color:mz.col,fontSize:8,marginTop:2}}>{mz.label}</div></div>
            <Badge label={mz.sig}/>
          </div>
          <MiniBar val={onChain?.mvrvZ??0} min={-3} max={8} col={mz.col}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2,marginBottom:8}}><span style={{color:"#2E4060",fontSize:7}}>−3 bottom</span><span style={{color:"#2E4060",fontSize:7}}>+8 top</span></div>
          <StatRow label="MVRV RATIO" value={onChain?.mvrv!=null?onChain.mvrv.toFixed(3):"—"}/>
          <StatRow label="σ BASELINE" value={onChain?`${onChain.yrs} yrs`:"—"} col="#00C97A"/>
        </Card>
        <Card title="NUPL — Tier 1" accent={nz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div><div style={{fontSize:32,fontWeight:700,color:nz.col,fontFamily:"monospace"}}>{onChain?.nupl!=null?(onChain.nupl*100).toFixed(1)+"%":"—"}</div><div style={{color:nz.col,fontSize:8,marginTop:2}}>{nz.label} — {nz.band}</div></div>
            <Badge label={nz.band||"—"}/>
          </div>
          <MiniBar val={onChain?.nupl!=null?onChain.nupl*100:0} min={-50} max={100} col={nz.col}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2,marginBottom:8}}><span style={{color:"#2E4060",fontSize:7}}>Capitulation</span><span style={{color:"#2E4060",fontSize:7}}>Euphoria</span></div>
          {[{b:"Capitulation",c:"#00C97A"},{b:"Hope",c:"#7DEFA1"},{b:"Optimism",c:"#FFB800"},{b:"Belief",c:"#FF8C42"},{b:"Euphoria",c:"#FF4455"}].map(x=><span key={x.b} style={{display:"inline-block",marginRight:6,color:nz.band===x.b?x.c:"#2E4060",fontSize:7,fontWeight:nz.band===x.b?700:400}}>{x.b}</span>)}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="SOPR — Tier 2" accent={sz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:26,fontWeight:700,color:sz.col,fontFamily:"monospace"}}>{sopr!=null?sopr.toFixed(4):"—"}</div><div style={{color:sz.col,fontSize:8,marginTop:2}}>{sz.label}</div></div>
            <Badge label={sz.sig}/>
          </div>
          <MiniBar val={sopr??1} min={0.95} max={1.08} col={sz.col}/>
          <div style={{marginTop:8,padding:"6px 8px",background:"#080E1C",borderRadius:4,fontSize:7,color:"#2E4060",lineHeight:1.6}}>7-day smoothed (BGeometrics). Retest of 1.0 as support in bull correction = re-entry signal.</div>
        </Card>
        <Card title="Hash Ribbons — Tier 2" accent={hrInfo.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:26,fontWeight:700,color:hrInfo.col,fontFamily:"monospace"}}>{hrInfo.diff!=null?`${hrInfo.diff>0?"+":""}${hrInfo.diff.toFixed(2)}%`:"—"}</div><div style={{color:hrInfo.col,fontSize:8,marginTop:2}}>{hrInfo.label}</div></div>
            <Badge label={hrInfo.sig}/>
          </div>
          {hashD?.series&&<ResponsiveContainer width="100%" height={80}><LineChart data={hashD.series.slice(-60)} margin={{top:4,right:4,bottom:0,left:-24}}><XAxis dataKey="i" hide/><YAxis tick={{fill:"#2E4060",fontSize:7}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:"#0C1525",border:"1px solid #182035",borderRadius:4,fontSize:8}}/><Line type="monotone" dataKey="ma30" stroke="#00C97A" strokeWidth={2} dot={false} name="30D"/><Line type="monotone" dataKey="ma60" stroke="#FF8C42" strokeWidth={2} dot={false} name="60D"/></LineChart></ResponsiveContainer>}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="Puell Multiple — Tier 2" accent={pz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:26,fontWeight:700,color:pz.col,fontFamily:"monospace"}}>{puell!=null?puell.toFixed(3):"—"}</div><div style={{color:pz.col,fontSize:8,marginTop:2}}>{pz.label}</div></div>
            <Badge label={pz.sig}/>
          </div>
          <MiniBar val={puell??1} min={0} max={5} col={pz.col}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2,marginBottom:8}}><span style={{color:"#2E4060",fontSize:7}}>0.5 bottom</span><span style={{color:"#2E4060",fontSize:7}}>4+ top</span></div>
          <div style={{padding:"6px 8px",background:"#080E1C",borderRadius:4,fontSize:7,color:"#2E4060",lineHeight:1.6}}>Miner revenue vs 365d average. &lt;0.5 = capitulation bottoms, &gt;4 = cycle-top revenue extremes. BGeometrics.</div>
        </Card>
        <Card title="Address Activity — Tier 3" accent={az.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:26,fontWeight:700,color:az.col,fontFamily:"monospace"}}>{addr?.growth!=null?`${addr.growth>0?"+":""}${addr.growth.toFixed(1)}%`:"—"}</div><div style={{color:az.col,fontSize:8,marginTop:2}}>{az.label}</div></div>
            <Badge label={az.sig}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:"#080E1C",borderRadius:4,padding:"6px 8px"}}><div style={{color:"#2E4060",fontSize:7}}>30D AVG (NOW)</div><div style={{color:"#9BB8D8",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{addr?.cur30?Math.round(addr.cur30).toLocaleString():"—"}</div></div>
            <div style={{background:"#080E1C",borderRadius:4,padding:"6px 8px"}}><div style={{color:"#2E4060",fontSize:7}}>30D AVG (PRIOR)</div><div style={{color:"#9BB8D8",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{addr?.prev30?Math.round(addr.prev30).toLocaleString():"—"}</div></div>
          </div>
          <div style={{marginTop:8,padding:"6px 8px",background:"#080E1C",borderRadius:4,fontSize:7,color:"#2E4060",lineHeight:1.6}}>Active-address growth proxy for new participation. CoinMetrics AdrActCnt.</div>
        </Card>
      </div>
      {onChain?.series&&<Card title="MVRV-Z & NUPL — 90-Day Trend"><ResponsiveContainer width="100%" height={150}><LineChart data={onChain.series} margin={{top:6,right:8,bottom:0,left:-24}}><XAxis dataKey="date" tick={{fill:"#2E4060",fontSize:7}} tickLine={false} axisLine={false} interval={14}/><YAxis tick={{fill:"#2E4060",fontSize:7}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:"#0C1525",border:"1px solid #182035",borderRadius:4,fontSize:8}} formatter={(v,n)=>[v?.toFixed(3),n]}/><ReferenceLine y={0} stroke="#526880" strokeDasharray="2 4"/><Line type="monotone" dataKey="mvrvZ" stroke="#F7931A" strokeWidth={2} dot={false} name="MVRV-Z"/><Line type="monotone" dataKey="nupl" stroke="#7DEFA1" strokeWidth={2} dot={false} name="NUPL"/><Legend iconType="line" wrapperStyle={{fontSize:8,color:"#526880"}}/></LineChart></ResponsiveContainer></Card>}
    </>
  );
}
