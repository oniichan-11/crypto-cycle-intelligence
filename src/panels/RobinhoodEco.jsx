import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import { fmtBig, fmtPct, fmtP, pCol } from "../lib/math.js";

// Watchlist rows: CoinGecko id → role in the Robinhood Chain economy.
// FACTS, not picks — the chain has NO native token (gas is ETH, no airdrop announced),
// so these are the listed assets with disclosed economic links to the chain.
const ECO = [
  { id:"robinhood-xstock", sym:"HOODX",  role:"Tokenized HOOD equity (xStocks) — onchain proxy for the stock itself" },
  { id:"arbitrum",         sym:"ARB",    role:"Chain built on Arbitrum stack — 10% of chain fees to Arbitrum (80% DAO / 20% dev fund)" },
  { id:"ethereum",         sym:"ETH",    role:"Gas token + settlement layer — RH Chain settles to Ethereum" },
  { id:"uniswap",          sym:"UNI",    role:"Uniswap — day-one DEX on the chain" },
  { id:"chainlink",        sym:"LINK",   role:"Chainlink — day-one oracle infrastructure" },
  { id:"ethena",           sym:"ENA",    role:"Ethena — USDe is the chain's dominant stablecoin deposit" },
  { id:"morpho",           sym:"MORPHO", role:"Morpho — day-one lending market" },
];

export default function RobinhoodEco({ sector, defi, rhFees }) {
  const chain = defi?.chains?.find(c=>c.name==="Robinhood Chain");
  const arb   = defi?.chains?.find(c=>c.name==="Arbitrum");
  const byId  = id => sector?.find(c=>c.id===id);

  return (
    <>
      <div style={{padding:"10px 14px",background:"#1A0800",borderRadius:8,border:"1px solid #FF445544",marginBottom:10}}>
        <span style={{color:"#FF8C42",fontSize:8,lineHeight:1.7}}>
          <span style={{color:"#FF4455",fontWeight:700}}>RESEARCH ONLY — NOT INVESTMENT ADVICE.</span> This panel tracks publicly disclosed economic links to Robinhood Chain. It makes no entry, exit, valuation, or pairing recommendations. Tokenized stocks are derivative claims issued by third parties — not shares with ownership rights — and can trade away from the underlying, especially outside market hours.
        </span>
      </div>

      {/* Chain vitals */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
        <Card title="RH Chain TVL — DefiLlama">
          <div style={{fontSize:24,fontWeight:700,color:"#00C97A",fontFamily:"monospace"}}>{chain?fmtBig(chain.tvl):"—"}</div>
          <div style={{color:"#2E4060",fontSize:7,marginTop:4}}>Mainnet 2026-07-01 · Arbitrum stack · no native token</div>
        </Card>
        <Card title="Arbitrum TVL — Comparison">
          <div style={{fontSize:24,fontWeight:700,color:"#9BB8D8",fontFamily:"monospace"}}>{arb?fmtBig(arb.tvl):"—"}</div>
          <div style={{color:"#2E4060",fontSize:7,marginTop:4}}>Parent stack — collects 10% of RH Chain fees</div>
        </Card>
        <Card title="All-App Fees 24h">
          <div style={{fontSize:24,fontWeight:700,color:"#F7931A",fontFamily:"monospace"}}>{rhFees?fmtBig(rhFees.total24h):"—"}</div>
          <div style={{color:"#2E4060",fontSize:7,marginTop:4}}>Sum of every protocol's fees on the chain — higher than "chain fee" headlines</div>
        </Card>
        <Card title="All-App Fees 7d">
          <div style={{fontSize:24,fontWeight:700,color:"#F7931A",fontFamily:"monospace"}}>{rhFees?.total7d!=null?fmtBig(rhFees.total7d):"—"}</div>
          <div style={{color:"#2E4060",fontSize:7,marginTop:4}}>DefiLlama aggregate, trailing 7 days</div>
        </Card>
      </div>

      {/* Ecosystem watchlist */}
      <Card title="Disclosed-Exposure Watchlist — CoinGecko (live)" style={{marginBottom:10}}>
        <div style={{display:"grid",gridTemplateColumns:"70px 110px 64px 64px 90px 1fr",gap:"0 8px",padding:"0 4px 6px",borderBottom:"1px solid #182035"}}>
          {["ASSET","PRICE","24H","7D","MKT CAP","ECONOMIC LINK TO RH CHAIN"].map(h=><div key={h} style={{color:"#2E4060",fontSize:7,letterSpacing:1.5}}>{h}</div>)}
        </div>
        {ECO.map(e=>{
          const c=byId(e.id), p24=c?.price_change_percentage_24h, p7=c?.price_change_percentage_7d_in_currency;
          return (
            <div key={e.id} style={{display:"grid",gridTemplateColumns:"70px 110px 64px 64px 90px 1fr",gap:"0 8px",padding:"8px 4px",borderBottom:"1px solid #10182812",alignItems:"center"}}>
              <div><span style={{background:"#182035",color:"#F7931A",padding:"2px 5px",borderRadius:3,fontSize:9,fontWeight:700}}>{e.sym}</span></div>
              <div style={{color:"#9BB8D8",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{c?fmtP(c.current_price):"—"}</div>
              <div style={{color:pCol(p24),fontSize:9,fontWeight:700}}>{fmtPct(p24)}</div>
              <div style={{color:pCol(p7),fontSize:9,fontWeight:700}}>{fmtPct(p7)}</div>
              <div style={{color:"#526880",fontSize:8}}>{c?fmtBig(c.market_cap):"—"}</div>
              <div style={{color:"#526880",fontSize:7,lineHeight:1.5}}>{e.role}</div>
            </div>
          );
        })}
        <div style={{marginTop:8,padding:"6px 8px",background:"#080E1C",borderRadius:4,fontSize:7,color:"#2E4060",lineHeight:1.6}}>
          HOODX is a third-party tokenized wrapper tracking HOOD — verify its peg against the actual NASDAQ quote before treating it as the stock's price. ARB/ETH/UNI also appear in their home sector tabs; they're repeated here for the ecosystem view.
        </div>
      </Card>

      {/* Pairs education — mechanics only */}
      <Card title="Pairs Trading — How It Works (Education, Not Picks)">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            {h:"THE MECHANIC",t:"A pairs trade goes long one asset and short a related one, betting on the SPREAD between them rather than market direction. Profit requires the relationship to converge; both legs can lose if it widens instead."},
            {h:"WHAT MAKES A VALID PAIR",t:"A durable economic link (not just past correlation), a spread history long enough to define 'stretched', and realistic borrow/funding costs on the short leg. Correlations discovered in hindsight routinely break in live trading."},
            {h:"THIS ECOSYSTEM'S CAVEATS",t:"Fee-share links (like chain→ARB) are real but small relative to each asset's own drivers. Tokenized stocks add peg, custody, and jurisdiction risk on top of equity risk. New-chain metrics (TVL, fees) are volatile and partly incentive-driven."},
          ].map(x=>(
            <div key={x.h} style={{background:"#080E1C",borderRadius:5,padding:"10px 12px"}}>
              <div style={{color:"#F7931A",fontSize:8,fontWeight:700,letterSpacing:1.5,marginBottom:6}}>{x.h}</div>
              <div style={{color:"#526880",fontSize:8,lineHeight:1.7}}>{x.t}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#2E4060",fontSize:7}}>This dashboard surfaces evidence; sizing and positioning decisions are yours. Nothing here is a recommendation.</span>
          <Badge label="EDUCATIONAL" col="#7DEFA1"/>
        </div>
      </Card>
    </>
  );
}
