import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import { fmtBig, fmtPct, fmtP, pCol } from "../lib/math.js";
import { COINS, SECTOR_TABS } from "../config/coins.js";

export default function Sectors({sector,tab,setTab,defi,verd}){
  const filtered = tab==="ALL"?sector:sector.filter(c=>COINS.find(x=>x.id===c.id)?.sector===tab);
  return(
    <>
      <Card title="Sector Watchlist — CoinGecko" style={{marginBottom:10}}>
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>{SECTOR_TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"#F7931A":"#F3F5F9",color:tab===t?"#F4F6FB":"#55606E",border:`1px solid ${tab===t?"#F7931A":"#E4E8F0"}`,borderRadius:8,padding:"4px 12px",fontSize:12,fontFamily:"inherit",fontWeight:700,cursor:"pointer"}}>{t}</button>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"64px 82px 100px 64px 64px 100px 84px",gap:"0 8px",padding:"0 4px 6px",borderBottom:"1px solid #E4E8F0"}}>{["ASSET","SECTOR","PRICE","24H","7D","SIGNAL","MKT CAP"].map(h=><div key={h} style={{color:"#6B7686",fontSize:11,letterSpacing:1.5}}>{h}</div>)}</div>
        {filtered.map(coin=>{const meta=COINS.find(c=>c.id===coin.id),p24=coin.price_change_percentage_24h,p7=coin.price_change_percentage_7d_in_currency,sig=p7>20&&p24>5?"BULLISH":p7<-20&&p24<-5?"BEARISH":p24>5?"CAUTIOUS BULLISH":p24<-5?"CAUTION":"NEUTRAL";return<div key={coin.id} style={{display:"grid",gridTemplateColumns:"64px 82px 100px 64px 64px 100px 84px",gap:"0 8px",padding:"7px 4px",borderBottom:"1px solid #EDF0F5",alignItems:"center"}}><div><span style={{background:"#E4E8F0",color:"#F7931A",padding:"2px 5px",borderRadius:3,fontSize:13,fontWeight:700}}>{meta?.sym||coin.symbol.toUpperCase()}</span></div><div style={{color:"#6B7484",fontSize:11}}>{meta?.sector||"—"}</div><div style={{color:"#171B24",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>{fmtP(coin.current_price)}</div><div style={{color:pCol(p24),fontSize:13,fontWeight:700}}>{fmtPct(p24)}</div><div style={{color:pCol(p7),fontSize:13,fontWeight:700}}>{fmtPct(p7)}</div><Badge label={sig}/><div style={{color:"#55606E",fontSize:12}}>{fmtBig(coin.market_cap)}</div></div>;})}
      </Card>
      {/* DeFi TVL intel */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="Chain TVL — DefiLlama (Free)">
          {defi?.chains?.length>0?(
            <ResponsiveContainer width="100%" height={Math.max(140,defi.chains.length*28)}>
              <BarChart layout="vertical" data={defi.chains} margin={{top:4,right:12,bottom:0,left:16}}>
                <XAxis type="number" tick={{fill:"#6B7686",fontSize:11}} tickLine={false} axisLine={false} tickFormatter={v=>fmtBig(v)}/>
                <YAxis type="category" dataKey="name" tick={{fill:"#626D7D",fontSize:12}} tickLine={false} axisLine={false} width={70}/>
                <Tooltip contentStyle={{background:"#FFFFFF",border:"1px solid #E4E8F0",borderRadius:8,fontSize:12}} formatter={v=>[fmtBig(v),"TVL"]}/>
                <Bar dataKey="tvl" fill="#F7931A" radius={[0,3,3,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{color:"#6B7686",fontSize:13,padding:"20px 0"}}>Loading chain TVL...</div>}
        </Card>
        <Card title="Protocol TVL — Your Sectors">
          {defi?.protocols&&Object.keys(defi.protocols).length>0?(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {Object.entries(defi.protocols).map(([sec,protos])=>(
                <div key={sec}>
                  <div style={{color:"#F7931A",fontSize:12,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>{sec.toUpperCase()}</div>
                  {protos.map(p=><div key={p.slug} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #EDF0F5"}}><span style={{color:"#626D7D",fontSize:13,textTransform:"capitalize"}}>{p.slug.replace(/-/g," ")}</span><span style={{color:"#171B24",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>{p.tvl!=null?fmtBig(p.tvl):"—"}</span></div>)}
                </div>
              ))}
            </div>
          ):<div style={{color:"#6B7686",fontSize:13,padding:"20px 0"}}>Loading protocol TVL...</div>}
        </Card>
      </div>
      {/* Rotation */}
      <Card title="Rotation Playbook">
        <div style={{color:"#6B7686",fontSize:11,letterSpacing:2,marginBottom:8}}>CURRENT: <span style={{color:verd.col}}>{verd.phase}</span></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{p:"Phase 1 — Early Bull",active:verd.phase.includes("EARLY")||verd.phase.includes("ACCUM"),n:"BTC → ETH → Large-cap L1s. Dominance rising."},{p:"Phase 2 — Mid Bull",active:verd.phase.includes("MID"),n:"Add L2s, DeFi, DePIN, Perp DEXes. Dom. peaks."},{p:"Phase 3 — Late Bull",active:verd.phase.includes("LATE")||verd.phase.includes("DIST"),n:"Selective AI/high-beta. Hard exits. Scale down."}].map(x=><div key={x.p} style={{background:x.active?"#E4E8F0":"transparent",borderRadius:5,padding:"8px 10px",border:`1px solid ${x.active?"#F7931A44":"#E4E8F0"}`}}><div style={{color:x.active?"#F7931A":"#6B7686",fontSize:12,fontWeight:700,marginBottom:4}}>{x.p}</div><div style={{color:"#6B7686",fontSize:11,lineHeight:1.6,marginBottom:x.active?6:0}}>{x.n}</div>{x.active&&<Badge label="ACTIVE NOW" col="#F7931A"/>}</div>)}
        </div>
      </Card>
    </>
  );
}
