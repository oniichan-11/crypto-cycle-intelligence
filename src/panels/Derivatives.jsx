import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import StatRow from "../components/StatRow.jsx";
import { fmtBig, fmtPct, pCol } from "../lib/math.js";

export default function Derivatives({funding,fz,netflow,nf}){
  return(
    <>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        {/* Funding */}
        <Card title="Funding Rates — Tier 3 (OKX + Aggregate)" accent={fz.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:30,fontWeight:700,color:fz.col,fontFamily:"inherit"}}>{funding?.aggregate!=null?`${funding.aggregate>0?"+":""}${funding.aggregate.toFixed(4)}%`:"—"}</div>
              <div style={{color:fz.col,fontSize:12,marginTop:2}}>{fz.label}</div>
              <div style={{color:"#6B7686",fontSize:11,marginTop:5}}>8-hour funding. Aggregate = BTC+ETH mean benchmark.</div>
            </div>
            <Badge label={fz.sig}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <StatRow label="BTC (OKX)" value={funding?.binance!=null?`${funding.binance.toFixed(4)}%`:"—"} col={pCol(funding?.binance,true)}/>
            <StatRow label="ETH (OKX)" value={funding?.eth!=null?`${funding.eth.toFixed(4)}%`:"—"} col={pCol(funding?.eth,true)}/>
          </div>
          {funding?.history?.length>0&&<ResponsiveContainer width="100%" height={90}><BarChart data={funding.history} margin={{top:4,right:4,bottom:0,left:-24}}><XAxis dataKey="t" tick={{fill:"#6B7686",fontSize:10}} tickLine={false} axisLine={false} interval={5}/><YAxis tick={{fill:"#6B7686",fontSize:11}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E4E8F0",borderRadius:8,fontSize:12}} formatter={v=>[`${v.toFixed(4)}%`,"Funding"]}/><ReferenceLine y={0} stroke="#55606E"/><Bar dataKey="rate">{funding.history.map((e,i)=><Cell key={i} fill={e.rate>=0?"#D9720F":"#17A257"}/>)}</Bar></BarChart></ResponsiveContainer>}
          <div style={{marginTop:6,padding:"6px 8px",background:"#F3F5F9",borderRadius:8,fontSize:11,color:"#6B7686",lineHeight:1.6}}>Negative funding in uptrend = underleveraged = fuel remains. Sustained high positive = flush risk.</div>
        </Card>

        {/* Blended Netflow */}
        <Card title="Exchange Netflow — True Flows + Liquidity Blend" accent={nf.col}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:26,fontWeight:700,color:nf.col,fontFamily:"inherit"}}>{nf.composite!=null?(nf.composite>0?"NET INFLOW":"NET OUTFLOW"):"—"}</div>
              <div style={{color:nf.col,fontSize:12,marginTop:2}}>{nf.label}</div>
            </div>
            <Badge label="BLENDED"/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{background:"#F3F5F9",borderRadius:5,padding:"8px 10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{color:"#55606E",fontSize:12}}>Stablecoin Supply Δ (7d)</span>
                <span style={{color:pCol(netflow?.scChg),fontSize:14,fontWeight:700,fontFamily:"inherit"}}>{netflow?.scChg!=null?fmtPct(netflow.scChg):"—"}</span>
              </div>
              <div style={{color:"#6B7686",fontSize:11}}>DefiLlama · rising = dry powder entering (bullish)</div>
            </div>
            <div style={{background:"#F3F5F9",borderRadius:5,padding:"8px 10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{color:"#55606E",fontSize:12}}>Net Exchange Flow (7d avg)</span>
                <span style={{color:pCol(netflow?.flowNet,true),fontSize:14,fontWeight:700,fontFamily:"inherit"}}>{netflow?.flowNet!=null?`${netflow.flowNet>0?"+":""}${Math.round(netflow.flowNet).toLocaleString()} BTC/d`:"—"}</span>
              </div>
              <div style={{color:"#6B7686",fontSize:11}}>CoinMetrics FlowIn−FlowOut · TRUE netflow — negative = coins leaving exchanges (bullish)</div>
            </div>
            <div style={{background:"#F3F5F9",borderRadius:5,padding:"8px 10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{color:"#55606E",fontSize:12}}>Exchange Balance Δ (7d)</span>
                <span style={{color:pCol(netflow?.balChg,true),fontSize:14,fontWeight:700,fontFamily:"inherit"}}>{netflow?.balChg!=null?fmtPct(netflow.balChg):"—"}</span>
              </div>
              <div style={{color:"#6B7686",fontSize:11}}>CoinMetrics SplyExNtv {netflow?.balNow?`(${(netflow.balNow/1e6).toFixed(2)}M BTC held)`:""} · falling = accumulation to cold storage</div>
            </div>
            <div style={{background:`${nf.col}12`,borderRadius:5,padding:"8px 10px",border:`1px solid ${nf.col}33`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:nf.col,fontSize:12,fontWeight:700}}>COMPOSITE VERDICT</span>
                <Badge label={nf.sig}/>
              </div>
            </div>
          </div>
          <div style={{marginTop:8,padding:"6px 8px",background:"#F3F5F9",borderRadius:8,fontSize:11,color:"#6B7686",lineHeight:1.6}}>Upgraded from proxy blend to TRUE exchange flows — CoinMetrics freed FlowInEx/FlowOutEx/SplyEx on the community tier. The Glassnode gap is closed.</div>
        </Card>
      </div>
      <Card title="Stablecoin Supply — Liquidity Dry Powder">
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          <div style={{background:"#F3F5F9",borderRadius:6,padding:"12px 14px"}}>
            <div style={{color:"#6B7686",fontSize:11,letterSpacing:2,marginBottom:5}}>TOTAL STABLE MCAP</div>
            <div style={{color:"#171B24",fontSize:21,fontWeight:700,fontFamily:"inherit"}}>{netflow?.scNow?fmtBig(netflow.scNow):"—"}</div>
            <div style={{color:"#6B7686",fontSize:11,marginTop:3}}>DefiLlama · all chains</div>
          </div>
          <div style={{background:"#F3F5F9",borderRadius:6,padding:"12px 14px"}}>
            <div style={{color:"#6B7686",fontSize:11,letterSpacing:2,marginBottom:5}}>7-DAY CHANGE</div>
            <div style={{color:pCol(netflow?.scChg),fontSize:21,fontWeight:700,fontFamily:"inherit"}}>{netflow?.scChg!=null?fmtPct(netflow.scChg):"—"}</div>
            <div style={{color:"#6B7686",fontSize:11,marginTop:3}}>Expanding = risk-on liquidity</div>
          </div>
          <div style={{background:"#F3F5F9",borderRadius:6,padding:"12px 14px"}}>
            <div style={{color:"#6B7686",fontSize:11,letterSpacing:2,marginBottom:5}}>SIGNAL READ</div>
            <div style={{color:nf.col,fontSize:16,fontWeight:700,marginTop:4}}>{netflow?.scChg>0?"DRY POWDER BUILDING":netflow?.scChg<0?"LIQUIDITY LEAVING":"—"}</div>
          </div>
        </div>
      </Card>
    </>
  );
}
