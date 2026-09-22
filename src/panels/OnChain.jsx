import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import StatRow from "../components/StatRow.jsx";
import MiniBar from "../components/MiniBar.jsx";

export default function OnChain({onChain,hashD,mz,nz,sz,hrInfo,sopr,puell,pz,addr,az}){
  return(
    <>
      <div style={{padding:"8px 12px",background:"#FFFFFF",borderRadius:6,border:"1px solid #E4E8F0",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#17A257",flexShrink:0}}/>
        <span style={{color:"#55606E",fontSize:12}}>Sources: <span style={{color:"#17A257"}}>CoinMetrics Community</span> (MVRV, market cap — realized cap & NUPL derived from the free MVRV ratio) + <span style={{color:"#17A257"}}>BGeometrics</span> (SOPR, Puell). MVRV-Z σ from <span style={{color:"#171B24"}}>{onChain?.yrs||"—"} years</span> ({onChain?.nRows||"—"} days) of history.</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="MVRV-Z Score — Tier 1" accent={mz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div><div style={{fontSize:34,fontWeight:700,color:mz.col,fontFamily:"inherit"}}>{onChain?.mvrvZ!=null?onChain.mvrvZ.toFixed(2):"—"}</div><div style={{color:mz.col,fontSize:12,marginTop:2}}>{mz.label}</div></div>
            <Badge label={mz.sig}/>
          </div>
          <MiniBar val={onChain?.mvrvZ??0} min={-3} max={8} col={mz.col}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2,marginBottom:8}}><span style={{color:"#6B7686",fontSize:11}}>−3 bottom</span><span style={{color:"#6B7686",fontSize:11}}>+8 top</span></div>
          <StatRow label="MVRV RATIO" value={onChain?.mvrv!=null?onChain.mvrv.toFixed(3):"—"}/>
          <StatRow label="σ BASELINE" value={onChain?`${onChain.yrs} yrs`:"—"} col="#17A257"/>
        </Card>
        <Card title="NUPL — Tier 1" accent={nz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div><div style={{fontSize:34,fontWeight:700,color:nz.col,fontFamily:"inherit"}}>{onChain?.nupl!=null?(onChain.nupl*100).toFixed(1)+"%":"—"}</div><div style={{color:nz.col,fontSize:12,marginTop:2}}>{nz.label} — {nz.band}</div></div>
            <Badge label={nz.band||"—"}/>
          </div>
          <MiniBar val={onChain?.nupl!=null?onChain.nupl*100:0} min={-50} max={100} col={nz.col}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2,marginBottom:8}}><span style={{color:"#6B7686",fontSize:11}}>Capitulation</span><span style={{color:"#6B7686",fontSize:11}}>Euphoria</span></div>
          {[{b:"Capitulation",c:"#17A257"},{b:"Hope",c:"#2E9E5B"},{b:"Optimism",c:"#8A6100"},{b:"Belief",c:"#D9720F"},{b:"Euphoria",c:"#E23A4E"}].map(x=><span key={x.b} style={{display:"inline-block",marginRight:6,color:nz.band===x.b?x.c:"#6B7686",fontSize:11,fontWeight:nz.band===x.b?700:400}}>{x.b}</span>)}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="SOPR — Tier 2" accent={sz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:28,fontWeight:700,color:sz.col,fontFamily:"inherit"}}>{sopr!=null?sopr.toFixed(4):"—"}</div><div style={{color:sz.col,fontSize:12,marginTop:2}}>{sz.label}</div></div>
            <Badge label={sz.sig}/>
          </div>
          <MiniBar val={sopr??1} min={0.95} max={1.08} col={sz.col}/>
          <div style={{marginTop:8,padding:"6px 8px",background:"#F3F5F9",borderRadius:8,fontSize:11,color:"#6B7686",lineHeight:1.6}}>7-day smoothed (BGeometrics). Retest of 1.0 as support in bull correction = re-entry signal.</div>
        </Card>
        <Card title="Hash Ribbons — Tier 2" accent={hrInfo.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:28,fontWeight:700,color:hrInfo.col,fontFamily:"inherit"}}>{hrInfo.diff!=null?`${hrInfo.diff>0?"+":""}${hrInfo.diff.toFixed(2)}%`:"—"}</div><div style={{color:hrInfo.col,fontSize:12,marginTop:2}}>{hrInfo.label}</div></div>
            <Badge label={hrInfo.sig}/>
          </div>
          {hashD?.series&&<ResponsiveContainer width="100%" height={80}><LineChart data={hashD.series.slice(-60)} margin={{top:4,right:4,bottom:0,left:-24}}><XAxis dataKey="i" hide/><YAxis tick={{fill:"#6B7686",fontSize:11}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E4E8F0",borderRadius:8,fontSize:12}}/><Line type="monotone" dataKey="ma30" stroke="#17A257" strokeWidth={2} dot={false} name="30D"/><Line type="monotone" dataKey="ma60" stroke="#D9720F" strokeWidth={2} dot={false} name="60D"/></LineChart></ResponsiveContainer>}
        </Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="Puell Multiple — Tier 2" accent={pz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:28,fontWeight:700,color:pz.col,fontFamily:"inherit"}}>{puell!=null?puell.toFixed(3):"—"}</div><div style={{color:pz.col,fontSize:12,marginTop:2}}>{pz.label}</div></div>
            <Badge label={pz.sig}/>
          </div>
          <MiniBar val={puell??1} min={0} max={5} col={pz.col}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2,marginBottom:8}}><span style={{color:"#6B7686",fontSize:11}}>0.5 bottom</span><span style={{color:"#6B7686",fontSize:11}}>4+ top</span></div>
          <div style={{padding:"6px 8px",background:"#F3F5F9",borderRadius:8,fontSize:11,color:"#6B7686",lineHeight:1.6}}>Miner revenue vs 365d average. &lt;0.5 = capitulation bottoms, &gt;4 = cycle-top revenue extremes. BGeometrics.</div>
        </Card>
        <Card title="Address Activity — Tier 3" accent={az.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><div style={{fontSize:28,fontWeight:700,color:az.col,fontFamily:"inherit"}}>{addr?.growth!=null?`${addr.growth>0?"+":""}${addr.growth.toFixed(1)}%`:"—"}</div><div style={{color:az.col,fontSize:12,marginTop:2}}>{az.label}</div></div>
            <Badge label={az.sig}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{background:"#F3F5F9",borderRadius:8,padding:"6px 8px"}}><div style={{color:"#6B7686",fontSize:11}}>30D AVG (NOW)</div><div style={{color:"#171B24",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>{addr?.cur30?Math.round(addr.cur30).toLocaleString():"—"}</div></div>
            <div style={{background:"#F3F5F9",borderRadius:8,padding:"6px 8px"}}><div style={{color:"#6B7686",fontSize:11}}>30D AVG (PRIOR)</div><div style={{color:"#171B24",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>{addr?.prev30?Math.round(addr.prev30).toLocaleString():"—"}</div></div>
          </div>
          <div style={{marginTop:8,padding:"6px 8px",background:"#F3F5F9",borderRadius:8,fontSize:11,color:"#6B7686",lineHeight:1.6}}>Active-address growth proxy for new participation. CoinMetrics AdrActCnt.</div>
        </Card>
      </div>
      {onChain?.series&&<Card title="MVRV-Z & NUPL — 90-Day Trend"><ResponsiveContainer width="100%" height={150}><LineChart data={onChain.series} margin={{top:6,right:8,bottom:0,left:-24}}><XAxis dataKey="date" tick={{fill:"#6B7686",fontSize:11}} tickLine={false} axisLine={false} interval={14}/><YAxis tick={{fill:"#6B7686",fontSize:11}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E4E8F0",borderRadius:8,fontSize:12}} formatter={(v,n)=>[v?.toFixed(3),n]}/><ReferenceLine y={0} stroke="#55606E" strokeDasharray="2 4"/><Line type="monotone" dataKey="mvrvZ" stroke="#F7931A" strokeWidth={2} dot={false} name="MVRV-Z"/><Line type="monotone" dataKey="nupl" stroke="#2E9E5B" strokeWidth={2} dot={false} name="NUPL"/><Legend iconType="line" wrapperStyle={{fontSize:12,color:"#55606E"}}/></LineChart></ResponsiveContainer></Card>}
    </>
  );
}
