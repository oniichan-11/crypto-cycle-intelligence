import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Card from "../components/Card.jsx";
import StatRow from "../components/StatRow.jsx";
import FGGauge from "../components/FGGauge.jsx";
import { fmt, fmtBig, fmtPct, pCol } from "../lib/math.js";

export default function Overview({btc,global,fg,mempool,onChain,netflow,dxyVal,dxySrc,hrInfo,p7d,p30d,athPct,dom,fgChart}){
  return(
    <>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
        <Card title="BTC / USD — CoinGecko">
          <div style={{fontSize:20,fontWeight:700,color:"#F7931A",marginBottom:6}}>{btc?`$${fmt(btc.market_data.current_price.usd,0)}`:"—"}</div>
          <div style={{display:"flex",gap:10,marginBottom:10}}>{[{l:"24H",v:btc?.market_data?.price_change_percentage_24h},{l:"7D",v:p7d},{l:"30D",v:p30d}].map(p=><div key={p.l}><div style={{color:"#2E4060",fontSize:7}}>{p.l}</div><div style={{color:pCol(p.v),fontSize:10,fontWeight:700}}>{fmtPct(p.v)}</div></div>)}</div>
          <StatRow label="MARKET CAP" value={btc?fmtBig(btc.market_data.market_cap.usd):"—"}/>
          <StatRow label="REALIZED CAP" value={onChain?fmtBig(onChain.realCap):"—"} sub="CoinMetrics"/>
          <StatRow label="24H VOLUME" value={btc?fmtBig(btc.market_data.total_volume.usd):"—"}/>
          <StatRow label="ATH DRAWDOWN" value={fmtPct(athPct)} col={pCol(athPct,true)}/>
        </Card>
        <Card title="Sentiment — Alternative.me">
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 0"}}><FGGauge value={fg?.[0]?.value}/></div>
          <div style={{marginTop:8}}>
            <StatRow label="TODAY" value={fg?.[0]?.value_classification??"—"}/>
            <StatRow label="7D AVG" value={fg?Math.round(fg.slice(0,7).reduce((a,b)=>a+parseInt(b.value),0)/7):"—"}/>
            <StatRow label="30D AVG" value={fg?Math.round(fg.slice(0,30).reduce((a,b)=>a+parseInt(b.value),0)/Math.min(fg.length,30)):"—"}/>
          </div>
        </Card>
        <Card title="Global Market — CoinGecko">
          <div style={{fontSize:18,fontWeight:700,color:"#9BB8D8",marginBottom:4}}>{global?fmtBig(global.total_market_cap.usd):"—"}</div>
          <div style={{color:pCol(global?.market_cap_change_percentage_24h_usd),fontSize:10,fontWeight:700,marginBottom:10}}>{fmtPct(global?.market_cap_change_percentage_24h_usd)} (24H)</div>
          <StatRow label="BTC DOMINANCE" value={dom?`${dom.toFixed(1)}%`:"—"} col="#F7931A"/>
          <StatRow label="ETH DOMINANCE" value={global?.market_cap_percentage?.eth?`${global.market_cap_percentage.eth.toFixed(1)}%`:"—"}/>
          <StatRow label="STABLE MCAP" value={netflow?.scNow?fmtBig(netflow.scNow):"—"} sub="DefiLlama"/>
          <StatRow label="DXY INDEX" value={dxyVal?dxyVal.toFixed(2):"—"} col={dxyVal?pCol(dxyVal-100,true):undefined} sub={dxySrc||"—"}/>
        </Card>
        <Card title="BTC Network — Mempool.space">
          {mempool?(<>
            <div style={{marginBottom:10}}>
              <div style={{color:"#2E4060",fontSize:7,letterSpacing:2,marginBottom:4}}>DIFFICULTY EPOCH</div>
              <div style={{background:"#080E1C",borderRadius:3,height:5,overflow:"hidden"}}><div style={{background:"#F7931A",height:"100%",width:`${(mempool.progressPercent||0).toFixed(1)}%`,borderRadius:3}}/></div>
              <div style={{color:"#F7931A",fontSize:9,fontWeight:700,marginTop:3}}>{(mempool.progressPercent||0).toFixed(1)}%</div>
            </div>
            <StatRow label="DIFF CHANGE" value={mempool.difficultyChange!=null?fmtPct(mempool.difficultyChange):"—"} col={pCol(mempool.difficultyChange)}/>
            <StatRow label="HASH RIBBON" value={hrInfo.diff!=null?`${hrInfo.diff>0?"+":""}${hrInfo.diff.toFixed(1)}%`:"—"} col={hrInfo.col}/>
            {/* mempool.space remainingTime is in ms (pre-existing bug in the artifact divided by 86400) */}
            <StatRow label="RETARGET IN" value={mempool.remainingTime?`${(mempool.remainingTime/86400000).toFixed(1)}d`:"—"}/>
          </>):<div style={{color:"#2E4060",fontSize:9}}>Connecting...</div>}
        </Card>
      </div>
      <Card title="Fear & Greed — 14-Day History">
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={fgChart} margin={{top:6,right:4,bottom:0,left:-24}}>
            <defs><linearGradient id="fgg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F7931A" stopOpacity={0.25}/><stop offset="95%" stopColor="#F7931A" stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="date" tick={{fill:"#2E4060",fontSize:7}} tickLine={false} axisLine={false} interval={2}/>
            <YAxis domain={[0,100]} tick={{fill:"#2E4060",fontSize:7}} tickLine={false} axisLine={false}/>
            <Tooltip contentStyle={{background:"#0C1525",border:"1px solid #182035",borderRadius:4,fontSize:9}} labelStyle={{color:"#526880"}} itemStyle={{color:"#F7931A"}} formatter={v=>[v,"Score"]}/>
            <ReferenceLine y={25} stroke="#FF4455" strokeDasharray="2 4" strokeOpacity={0.4}/>
            <ReferenceLine y={75} stroke="#00C97A" strokeDasharray="2 4" strokeOpacity={0.4}/>
            <Area type="monotone" dataKey="v" stroke="#F7931A" fill="url(#fgg)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
