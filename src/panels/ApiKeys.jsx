import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";

export default function ApiKeys({fredKey,setFredKey,fetchFRED,fredBusy,fredData,apiKey,setApiKey,fetchCoinAPI,apiBusy,dxyLive,defi,funding,mempool,dxyKeyless}){
  return(
    <>
      <div style={{padding:"12px 16px",background:"#001A0C",borderRadius:8,border:"1px solid #00C97A44",marginBottom:14}}>
        <div style={{color:"#00C97A",fontSize:9,fontWeight:700,marginBottom:6}}>✓ THE AGENT IS NOW FULLY SELF-SUFFICIENT ON FREE DATA</div>
        <div style={{color:"#7DEFA1",fontSize:8,lineHeight:1.7}}>Every core signal — on-chain (MVRV-Z, NUPL, SOPR, Hash Ribbons), funding rates, blended netflow, DeFi TVL, sentiment, and DXY — now runs on free, no-key or free-key sources. The keys below are optional enhancements, not requirements.</div>
      </div>
      <div style={{padding:"12px 16px",background:"#1A0800",borderRadius:8,border:"1px solid #FF445544",marginBottom:14}}>
        <div style={{color:"#FF4455",fontSize:9,fontWeight:700,marginBottom:6}}>⚠ SECURITY</div>
        <div style={{color:"#FF8C42",fontSize:8,lineHeight:1.7}}>Never paste keys into a chat interface — treat any key shared in chat as compromised and rotate it. Enter keys only in the fields below; they live in session memory only.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card title="FRED — Macro (Free Key, Optional)">
          <div style={{color:"#526880",fontSize:8,lineHeight:1.7,marginBottom:10}}>Adds M2, Fed Balance Sheet, Real Yields, HY Spreads. DXY already works keyless. Register at <span style={{color:"#F7931A"}}>fred.stlouisfed.org</span></div>
          <div style={{display:"flex",gap:6,marginBottom:8}}><input value={fredKey} onChange={e=>setFredKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchFRED()} placeholder="FRED key..." type="password" style={{background:"#080E1C",border:"1px solid #182035",borderRadius:4,color:"#9BB8D8",fontFamily:"monospace",fontSize:10,padding:"8px 12px",flex:1}}/><button onClick={fetchFRED} disabled={fredBusy||!fredKey.trim()} style={{background:(!fredKey.trim()||fredBusy)?"#182035":"#F7931A",color:(!fredKey.trim()||fredBusy)?"#3D5070":"#060C18",border:"none",borderRadius:4,padding:"8px 12px",fontFamily:"monospace",fontSize:9,fontWeight:700,cursor:(!fredKey.trim()||fredBusy)?"default":"pointer"}}>{fredBusy?"...":"FETCH ↗"}</button></div>
          <Badge label={Object.keys(fredData).length>0?"LIVE":"OPTIONAL"}/>
        </Card>
        <Card title="CoinAPI — Real-Time DXY (Optional)">
          <div style={{color:"#526880",fontSize:8,lineHeight:1.7,marginBottom:10}}>DXY already runs keyless via ECB. This adds real-time granularity. <span style={{color:"#F7931A"}}>coinapi.io</span></div>
          <div style={{display:"flex",gap:6,marginBottom:8}}><input value={apiKey} onChange={e=>setApiKey(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchCoinAPI()} placeholder="CoinAPI key..." type="password" style={{background:"#080E1C",border:"1px solid #182035",borderRadius:4,color:"#9BB8D8",fontFamily:"monospace",fontSize:10,padding:"8px 12px",flex:1}}/><button onClick={fetchCoinAPI} disabled={apiBusy||!apiKey.trim()} style={{background:(!apiKey.trim()||apiBusy)?"#182035":"#F7931A",color:(!apiKey.trim()||apiBusy)?"#3D5070":"#060C18",border:"none",borderRadius:4,padding:"8px 12px",fontFamily:"monospace",fontSize:9,fontWeight:700,cursor:(!apiKey.trim()||apiBusy)?"default":"pointer"}}>{apiBusy?"...":"FETCH ↗"}</button></div>
          <Badge label={dxyLive?"LIVE":"OPTIONAL"}/>
        </Card>
        <Card title="Data Source Health" style={{gridColumn:"1 / -1"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"}}>
            {[
              {src:"CoinGecko",status:"LIVE",note:"Price, market cap, dominance, sectors"},
              {src:"CoinMetrics Community",status:"LIVE",note:"MVRV(-Z), NUPL (derived), Hash Ribbons, TRUE exchange flows, price history, address activity"},
              {src:"BGeometrics",status:"LIVE",note:"SOPR, Puell Multiple (free, keyless)"},
              {src:"DefiLlama",status:defi?"LIVE":"CONNECTING",note:"Chain/protocol TVL, stablecoin supply"},
              {src:"OKX",status:funding?"LIVE":"CONNECTING",note:"Funding rates (BTC + ETH benchmark)"},
              {src:"Alternative.me",status:"LIVE",note:"Fear & Greed Index"},
              {src:"Mempool.space",status:mempool?"LIVE":"CONNECTING",note:"Difficulty epoch"},
              {src:"ECB / Frankfurter",status:dxyKeyless?"LIVE":"CONNECTING",note:"Keyless DXY computation"},
              {src:"FRED",status:Object.keys(fredData).length>0?"LIVE":"OPTIONAL",note:"M2, balance sheet, yields (free key)"},
            ].map(s=><div key={s.src} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid #10182812",alignItems:"center"}}><Badge label={s.status}/><div style={{flex:1}}><div style={{color:"#7A98B8",fontSize:9}}>{s.src}</div><div style={{color:"#2E4060",fontSize:7}}>{s.note}</div></div></div>)}
          </div>
        </Card>
      </div>
    </>
  );
}
