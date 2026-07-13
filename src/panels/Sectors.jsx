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
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>{SECTOR_TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"#F7931A":"#080E1C",color:tab===t?"#060C18":"#526880",border:`1px solid ${tab===t?"#F7931A":"#182035"}`,borderRadius:4,padding:"4px 12px",fontSize:8,fontFamily:"monospace",fontWeight:700,cursor:"pointer"}}>{t}</button>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"64px 82px 100px 64px 64px 100px 84px",gap:"0 8px",padding:"0 4px 6px",borderBottom:"1px solid #182035"}}>{["ASSET","SECTOR","PRICE","24H","7D","SIGNAL","MKT CAP"].map(h=><div key={h} style={{color:"#2E4060",fontSize:7,letterSpacing:1.5}}>{h}</div>)}</div>
        {filtered.map(coin=>{const meta=COINS.find(c=>c.id===coin.id),p24=coin.price_change_percentage_24h,p7=coin.price_change_percentage_7d_in_currency,sig=p7>20&&p24>5?"BULLISH":p7<-20&&p24<-5?"BEARISH":p24>5?"CAUTIOUS BULLISH":p24<-5?"CAUTION":"NEUTRAL";return<div key={coin.id} style={{display:"grid",gridTemplateColumns:"64px 82px 100px 64px 64px 100px 84px",gap:"0 8px",padding:"7px 4px",borderBottom:"1px solid #10182812",alignItems:"center"}}><div><span style={{background:"#182035",color:"#F7931A",padding:"2px 5px",borderRadius:3,fontSize:9,fontWeight:700}}>{meta?.sym||coin.symbol.toUpperCase()}</span></div><div style={{color:"#3D5070",fontSize:7}}>{meta?.sector||"—"}</div><div style={{color:"#9BB8D8",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{fmtP(coin.current_price)}</div><div style={{color:pCol(p24),fontSize:9,fontWeight:700}}>{fmtPct(p24)}</div><div style={{color:pCol(p7),fontSize:9,fontWeight:700}}>{fmtPct(p7)}</div><Badge label={sig}/><div style={{color:"#526880",fontSize:8}}>{fmtBig(coin.market_cap)}</div></div>;})}
      </Card>
      {/* DeFi TVL intel */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Card title="Chain TVL — DefiLlama (Free)">
          {defi?.chains?.length>0?(
            <ResponsiveContainer width="100%" height={Math.max(140,defi.chains.length*28)}>
              <BarChart layout="vertical" data={defi.chains} margin={{top:4,right:12,bottom:0,left:16}}>
                <XAxis type="number" tick={{fill:"#2E4060",fontSize:7}} tickLine={false} axisLine={false} tickFormatter={v=>fmtBig(v)}/>
                <YAxis type="category" dataKey="name" tick={{fill:"#7A98B8",fontSize:8}} tickLine={false} axisLine={false} width={70}/>
                <Tooltip contentStyle={{background:"#0C1525",border:"1px solid #182035",borderRadius:4,fontSize:8}} formatter={v=>[fmtBig(v),"TVL"]}/>
                <Bar dataKey="tvl" fill="#F7931A" radius={[0,3,3,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{color:"#2E4060",fontSize:9,padding:"20px 0"}}>Loading chain TVL...</div>}
        </Card>
        <Card title="Protocol TVL — Your Sectors">
          {defi?.protocols&&Object.keys(defi.protocols).length>0?(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {Object.entries(defi.protocols).map(([sec,protos])=>(
                <div key={sec}>
                  <div style={{color:"#F7931A",fontSize:8,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>{sec.toUpperCase()}</div>
                  {protos.map(p=><div key={p.slug} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #10182812"}}><span style={{color:"#7A98B8",fontSize:9,textTransform:"capitalize"}}>{p.slug.replace(/-/g," ")}</span><span style={{color:"#9BB8D8",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{p.tvl!=null?fmtBig(p.tvl):"—"}</span></div>)}
                </div>
              ))}
            </div>
          ):<div style={{color:"#2E4060",fontSize:9,padding:"20px 0"}}>Loading protocol TVL...</div>}
        </Card>
      </div>
      {/* Rotation */}
      <Card title="Rotation Playbook">
        <div style={{color:"#2E4060",fontSize:7,letterSpacing:2,marginBottom:8}}>CURRENT: <span style={{color:verd.col}}>{verd.phase}</span></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{p:"Phase 1 — Early Bull",active:verd.phase.includes("EARLY")||verd.phase.includes("ACCUM"),n:"BTC → ETH → Large-cap L1s. Dominance rising."},{p:"Phase 2 — Mid Bull",active:verd.phase.includes("MID"),n:"Add L2s, DeFi, DePIN, Perp DEXes. Dom. peaks."},{p:"Phase 3 — Late Bull",active:verd.phase.includes("LATE")||verd.phase.includes("DIST"),n:"Selective AI/high-beta. Hard exits. Scale down."}].map(x=><div key={x.p} style={{background:x.active?"#182035":"transparent",borderRadius:5,padding:"8px 10px",border:`1px solid ${x.active?"#F7931A44":"#182035"}`}}><div style={{color:x.active?"#F7931A":"#2E4060",fontSize:8,fontWeight:700,marginBottom:4}}>{x.p}</div><div style={{color:"#2E4060",fontSize:7,lineHeight:1.6,marginBottom:x.active?6:0}}>{x.n}</div>{x.active&&<Badge label="ACTIVE NOW" col="#F7931A"/>}</div>)}
        </div>
      </Card>
    </>
  );
}
