import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import { fmtBig, fmtPct } from "../lib/math.js";

export default function Signals({onChain,mz,nz,sz,hrInfo,nf,fg,funding,fz,dom,athPct,dxyVal,dxySrc,fredData,ycVal,verd,sopr,puell,pz,addr,az}){
  return(
    <Card title="Full Confluence Matrix — All Free Sources">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        {[
          {group:"Tier 1 — On-Chain Anchors",col:"#F7931A",sigs:[
            {n:"MVRV-Z Score",v:onChain?.mvrvZ!=null?onChain.mvrvZ.toFixed(2):"—",s:mz.sig,src:"CoinMetrics"},
            {n:"NUPL Band",v:nz.band,s:nz.band,src:"CoinMetrics"},
          ]},
          {group:"Tier 2 — Momentum",col:"#2E9E5B",sigs:[
            {n:"SOPR (7D)",v:sopr!=null?sopr.toFixed(4):"—",s:sz.sig,src:"BGeometrics"},
            {n:"Puell Multiple",v:puell!=null?puell.toFixed(3):"—",s:pz.sig,src:"BGeometrics"},
            {n:"Hash Ribbons",v:hrInfo.diff!=null?`${hrInfo.diff>0?"+":""}${hrInfo.diff.toFixed(2)}%`:"—",s:hrInfo.sig,src:"CoinMetrics"},
            {n:"Exchange Netflow",v:nf.composite!=null?(nf.composite>0?"INFLOW":"OUTFLOW"):"—",s:nf.sig,src:"CoinMetrics flows + DefiLlama"},
          ]},
          {group:"Tier 3 — Sentiment & Leverage",col:"#8A6100",sigs:[
            {n:"Fear & Greed",v:fg?.[0]?.value??"—",s:parseInt(fg?.[0]?.value||50)<40?"BULLISH":parseInt(fg?.[0]?.value||50)>70?"BEARISH":"NEUTRAL",src:"Alternative.me"},
            {n:"Funding (Agg)",v:funding?.aggregate!=null?`${funding.aggregate.toFixed(3)}%`:"—",s:fz.sig,src:"OKX"},
            {n:"Address Activity",v:addr?.growth!=null?`${addr.growth>0?"+":""}${addr.growth.toFixed(1)}%`:"—",s:az.sig,src:"CoinMetrics"},
            {n:"BTC Dominance",v:dom?`${dom.toFixed(1)}%`:"—",s:dom>58?"EARLY CYCLE":dom>45?"MID CYCLE":"LATE CYCLE",src:"CoinGecko"},
            {n:"ATH Drawdown",v:fmtPct(athPct),s:athPct<-50?"ACCUMULATE":athPct<-25?"EARLY BULL":athPct<-10?"MID BULL":"LATE BULL",src:"CoinGecko"},
          ]},
          {group:"Macro Overlay",col:"#171B24",sigs:[
            {n:"DXY Index",v:dxyVal?dxyVal.toFixed(2):"—",s:dxyVal?dxyVal<100?"BULLISH":dxyVal<105?"NEUTRAL":"BEARISH":"PENDING",src:dxySrc?.split(" ")[0]||"ECB"},
            {n:"US M2 Trend",v:fredData.m2?.[0]?fmtBig(parseFloat(fredData.m2[0].value)*1e9):"FRED key",s:fredData.m2?.[0]&&fredData.m2?.[1]?parseFloat(fredData.m2[0].value)>parseFloat(fredData.m2[1].value)?"BULLISH":"BEARISH":"PENDING",src:"FRED"},
            {n:"Yield Curve",v:ycVal!=null?`${ycVal.toFixed(2)}%`:"—",s:ycVal!=null?ycVal>0?"BULLISH":"BEARISH":"PENDING",src:"FRED"},
            {n:"HY Credit Spread",v:fredData.hy?.[0]?`${parseFloat(fredData.hy[0].value).toFixed(2)}%`:"—",s:fredData.hy?.[0]&&fredData.hy?.[1]?parseFloat(fredData.hy[0].value)<parseFloat(fredData.hy[1].value)?"BULLISH":"BEARISH":"PENDING",src:"FRED"},
          ]},
        ].map(group=><div key={group.group} style={{background:"#F3F5F9",borderRadius:6,padding:"12px 14px"}}><div style={{color:group.col,fontSize:12,fontWeight:700,letterSpacing:1.5,marginBottom:10,borderBottom:`1px solid ${group.col}22`,paddingBottom:6}}>{group.group.toUpperCase()}</div>{group.sigs.map(s=><div key={s.n} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #EDF0F5"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}><div><div style={{color:"#626D7D",fontSize:13}}>{s.n}</div><div style={{color:"#6B7686",fontSize:11,marginTop:1}}>{s.src} · FREE</div></div><span style={{color:"#171B24",fontSize:15,fontWeight:700,fontFamily:"inherit"}}>{s.v}</span></div><Badge label={s.s}/></div>)}</div>)}
      </div>
      <div style={{padding:"12px 16px",background:"#F3F5F9",borderRadius:6,border:`1px solid ${verd.col}33`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{color:"#6B7686",fontSize:11,marginBottom:3}}>SYNTHESIZED VERDICT · {verd.active} ACTIVE SIGNALS · 100% FREE STACK</div><div style={{color:verd.col,fontSize:19,fontWeight:700}}>{verd.phase}</div></div>
        <Badge label={verd.risk} col={verd.col}/>
      </div>
    </Card>
  );
}
