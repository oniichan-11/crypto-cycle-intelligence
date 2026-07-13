import { useState, useEffect, useCallback, useRef } from "react";

import { mvrvZone, nuplZone, soprZone, hrZone, fundingZone, netflowZone, puellZone, addrZone } from "./lib/signals.js";
import { verdict } from "./lib/verdict.js";
import { buildSnapshot, evaluateAlerts, loadSnapshot, saveSnapshot, loadAlerts, saveAlerts, clearAlerts } from "./lib/alerts.js";
import { loadPanelState, savePanelState } from "./lib/persist.js";

import { fetchBtc, fetchGlobal, fetchSectorMarkets } from "./fetchers/coingecko.js";
import { fetchFearGreed } from "./fetchers/alternative.js";
import { fetchDifficulty } from "./fetchers/mempool.js";
import { fetchOnChain, fetchHashRibbons, fetchAddressActivity, fetchExchangeFlows, fetchPriceHistory } from "./fetchers/coinmetrics.js";
import { buildCycleOverlay } from "./lib/cycles.js";
import { fetchStablecoinTrend, fetchDefiIntel } from "./fetchers/defillama.js";
import { fetchFunding } from "./fetchers/okx.js";
import { fetchSopr, fetchPuell } from "./fetchers/bgeometrics.js";
import { fetchKeylessDxy, fetchCoinApiDxy } from "./fetchers/forex.js";
import { fetchFredSeries } from "./fetchers/fred.js";

import Overview from "./panels/Overview.jsx";
import OnChain from "./panels/OnChain.jsx";
import Derivatives from "./panels/Derivatives.jsx";
import Macro from "./panels/Macro.jsx";
import Sectors from "./panels/Sectors.jsx";
import Signals from "./panels/Signals.jsx";
import Cycles from "./panels/Cycles.jsx";
import ApiKeys from "./panels/ApiKeys.jsx";
import Alerts from "./panels/Alerts.jsx";
import Clock from "./components/Clock.jsx";

const REFRESH_MS = 120000; // 120s polling — respects CoinGecko free-tier limits

export default function App(){
  // Hydrate from the last-known snapshot (≤24h) — instant paint, resilient to
  // transient API failures on the first fetch after a reload.
  const hyd=useRef(loadPanelState()).current;
  const [btc,setBtc]=useState(hyd?.btc??null);
  const [global,setGlobal]=useState(hyd?.global??null);
  const [fg,setFg]=useState(hyd?.fg??null);
  const [sector,setSector]=useState(hyd?.sector??[]);
  const [mempool,setMempool]=useState(hyd?.mempool??null);
  const [onChain,setOnChain]=useState(hyd?.onChain??null);
  const [hashD,setHashD]=useState(hyd?.hashD??null);
  const [funding,setFunding]=useState(hyd?.funding??null);
  const [netflow,setNetflow]=useState(hyd?.netflow??null);
  const [defi,setDefi]=useState(hyd?.defi??null);
  const [puell,setPuell]=useState(hyd?.puell??null);
  const [sopr,setSopr]=useState(hyd?.sopr??null);
  const [addr,setAddr]=useState(hyd?.addr??null);
  const [overlay,setOverlay]=useState(null);
  const [fredData,setFredData]=useState({});
  const [forex,setForex]=useState({});
  const [dxyLive,setDxyLive]=useState(null);
  const [dxyKeyless,setDxyKeyless]=useState(null);
  const [fredKey,setFredKey]=useState("");
  const [apiKey,setApiKey]=useState("");
  const [loading,setLoading]=useState(!hyd);
  const [lastSync,setLastSync]=useState(null);
  const [tab,setTab]=useState("ALL");
  const [panel,setPanel]=useState("overview");
  const [fredBusy,setFredBusy]=useState(false);
  const [apiBusy,setApiBusy]=useState(false);
  const [alerts,setAlerts]=useState(()=>loadAlerts());
  const prevSnapRef=useRef(null);

  const fetchFree=useCallback(async()=>{
    // Fast parallel batch
    const [btcR,globalR,fgR,sectorR,mempoolR]=await Promise.all([
      fetchBtc(),fetchGlobal(),fetchFearGreed(),fetchSectorMarkets(),fetchDifficulty(),
    ]);
    if(btcR)setBtc(btcR);
    if(globalR)setGlobal(globalR);
    if(fgR)setFg(fgR);
    if(sectorR)setSector(sectorR);
    if(mempoolR)setMempool(mempoolR);

    // Heavier computed signals in parallel — each fetcher degrades to null, never throws
    const [onChainR,hashR,scTrend,flowsR,fundingR,defiR,keylessDxy,addrR]=await Promise.all([
      fetchOnChain(),fetchHashRibbons(),fetchStablecoinTrend(),fetchExchangeFlows(),fetchFunding(),fetchDefiIntel(),fetchKeylessDxy(),fetchAddressActivity(),
    ]);
    if(onChainR)setOnChain(onChainR);
    if(hashR)setHashD(hashR);
    if(fundingR)setFunding(fundingR);
    if(defiR)setDefi(defiR);
    if(addrR)setAddr(addrR);
    // Three-leg blend: stablecoin Δ (DefiLlama) + REAL exchange balance Δ + REAL net flow (CM free tier)
    // Merge with previous values so a single failed leg doesn't blank a working one
    setNetflow(prev=>({
      scChg:scTrend?.scChg??prev?.scChg??null,
      balChg:flowsR?.balChg??prev?.balChg??null,
      flowNet:flowsR?.flowNet??prev?.flowNet??null,
      balNow:flowsR?.balNow??prev?.balNow??null,
      scNow:scTrend?.scNow??prev?.scNow??null,
      scPrev:scTrend?.scPrev??prev?.scPrev??null,
    }));
    if(keylessDxy){
      setDxyKeyless(keylessDxy.dxy);
      setForex(f=>Object.keys(f).length===0?keylessDxy.rates:f);
    }

    setLoading(false);
    setLastSync(new Date());
  },[]);

  useEffect(()=>{
    fetchFree();
    const t=setInterval(fetchFree,REFRESH_MS);
    return()=>clearInterval(t);
  },[fetchFree]);

  // BGeometrics daily metrics on their own hourly cadence — the API rate-limits
  // aggressively, and SOPR/Puell only change once per day anyway.
  const fetchSlow=useCallback(async()=>{
    // Sequential with a gap — BGeometrics enforces a strict per-second limit
    const s=await fetchSopr();
    if(s?.sopr7d!=null)setSopr(s.sopr7d);
    await new Promise(r=>setTimeout(r,1500));
    const p=await fetchPuell();
    if(p!=null)setPuell(p);
  },[]);
  useEffect(()=>{
    fetchSlow();
    const t=setInterval(fetchSlow,3600000);
    return()=>clearInterval(t);
  },[fetchSlow]);

  // Persist the panel snapshot after every successful sync (hydration source)
  useEffect(()=>{
    if(!lastSync)return;
    savePanelState({btc,global,fg,sector,mempool,onChain,hashD,funding,netflow,defi,puell,sopr,addr});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[lastSync]);

  // Cycle overlay: one price-history fetch on mount (localStorage-cached 12h)
  useEffect(()=>{
    (async()=>{
      const prices=await fetchPriceHistory();
      if(prices)setOverlay(buildCycleOverlay(prices));
    })();
  },[]);

  const fetchFRED=async()=>{
    if(!fredKey.trim())return;
    setFredBusy(true);
    const res=await fetchFredSeries(fredKey);
    if(res)setFredData(res);
    setFredBusy(false);
  };
  const fetchCoinAPI=async()=>{
    if(!apiKey.trim())return;
    setApiBusy(true);
    const r=await fetchCoinApiDxy(apiKey);
    if(r){setDxyLive(r.dxy);setForex(r.rates);}
    setApiBusy(false);
  };

  // Derived
  const athPct=btc?.market_data?.ath_change_percentage?.usd||0;
  const dom=global?.market_cap_percentage?.btc||0;
  const p7d=btc?.market_data?.price_change_percentage_7d||0;
  const p30d=btc?.market_data?.price_change_percentage_30d||0;
  const fredDXY=fredData.dxy?.[0]?parseFloat(fredData.dxy[0].value):null;
  const dxyVal=dxyLive||dxyKeyless||fredDXY;
  const dxySrc=dxyLive?"CoinAPI (live)":dxyKeyless?"ECB/Frankfurter (keyless)":fredDXY?"FRED (delayed)":null;
  const ycVal=fredData.yc?.[0]?parseFloat(fredData.yc[0].value):null;
  const hrInfo=hrZone(hashD?.l30,hashD?.l60);
  const mz=mvrvZone(onChain?.mvrvZ), nz=nuplZone(onChain?.nupl), sz=soprZone(sopr);
  const fz=fundingZone(funding?.aggregate);
  const nf=netflowZone(netflow?.scChg,netflow?.balChg,netflow?.flowNet);
  const pz=puellZone(puell);
  const az=addrZone(addr?.growth??null);
  const verd=verdict({fg,dom,athPct,p7d,p30d,mvrvZ:onChain?.mvrvZ??null,nupl:onChain?.nupl??null,sopr,hrDiff:hrInfo.diff,funding:funding?.aggregate??null,netflow:nf.composite,dxy:dxyVal,yc:ycVal});
  const fgChart=fg?[...fg].reverse().slice(-14).map((d,i)=>({i,v:parseInt(d.value),date:new Date(parseInt(d.timestamp)*1000).toLocaleDateString("en",{month:"short",day:"numeric"})})):[];

  // ── Alerting layer: evaluate threshold crosses vs previous snapshot ─────────
  const snapshot=buildSnapshot({
    mvrvZ:onChain?.mvrvZ??null,
    nupl:onChain?.nupl??null,
    sopr,
    hrDiff:hrInfo.diff,
    funding:funding?.aggregate??null,
    netflow:nf.composite,
    fg:fg?.[0]?.value!=null?parseInt(fg[0].value):null,
    dxy:dxyVal,
    phase:verd.phase,
  });
  const snapKey=JSON.stringify({...snapshot,ts:0});
  useEffect(()=>{
    if(loading)return;
    const prev=prevSnapRef.current||loadSnapshot();
    const fired=evaluateAlerts(prev,snapshot);
    if(fired.length){
      setAlerts(a=>{const merged=[...fired,...a].slice(0,100);saveAlerts(merged);return merged;});
    }
    prevSnapRef.current=snapshot;
    saveSnapshot(snapshot);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[snapKey,loading]);

  const handleClearAlerts=()=>{setAlerts([]);clearAlerts();};
  const latestAlert=alerts[0];

  const NAV=[{id:"overview",l:"Overview"},{id:"onchain",l:"On-Chain"},{id:"derivs",l:"Derivatives"},{id:"macro",l:"Macro/DXY"},{id:"sectors",l:"Sectors/DeFi"},{id:"cycles",l:"Cycles"},{id:"signals",l:"Signals"},{id:"alerts",l:`Alerts${alerts.length?` (${alerts.length})`:""}`},{id:"keys",l:"API Keys"}];

  if(loading)return(
    <div style={{background:"#060C18",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:36,color:"#F7931A",marginBottom:16}}>◈</div>
        <div style={{color:"#F7931A",fontSize:11,letterSpacing:4}}>INITIALIZING INTELLIGENCE LAYER</div>
        <div style={{color:"#2E4060",fontSize:8,marginTop:8,letterSpacing:2}}>COINGECKO · COINMETRICS · DEFILLAMA · BINANCE · ECB</div>
        <div style={{color:"#1A2840",fontSize:8,marginTop:4,letterSpacing:2}}>Computing on-chain, funding, netflow & sector signals...</div>
      </div>
    </div>
  );

  return(
    <div style={{background:"#060C18",minHeight:"100vh",padding:"14px 14px 32px",fontFamily:"monospace",color:"#9BB8D8"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:"#F7931A",letterSpacing:1}}>◈ CRYPTO CYCLE INTELLIGENCE</div>
          <div style={{color:"#2E4060",fontSize:7,letterSpacing:3,marginTop:2}}>RESEARCH & INVESTMENT AGENT — v0.5 · TRUE NETFLOW + ALERTS + CYCLE OVERLAY</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#9BB8D8"}}><Clock/></div>
          <div style={{color:"#2E4060",fontSize:7,marginTop:2}}>{lastSync?`SYNC ${lastSync.toLocaleTimeString("en-US",{hour12:false})}`:""}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end",marginTop:4}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#00C97A"}}/>
            <span style={{color:"#00C97A",fontSize:7,letterSpacing:2}}>LIVE — 120s REFRESH</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}>
        {NAV.map(n=><button key={n.id} onClick={()=>setPanel(n.id)} style={{background:panel===n.id?"#F7931A":"#0C1525",color:panel===n.id?"#060C18":"#526880",border:`1px solid ${panel===n.id?"#F7931A":"#182035"}`,borderRadius:4,padding:"5px 14px",fontSize:9,fontFamily:"monospace",fontWeight:700,cursor:"pointer",letterSpacing:1.5}}>{n.l}</button>)}
      </div>

      {/* Verdict banner */}
      <div style={{background:`linear-gradient(135deg,${verd.col}0E 0%,#0C1525 70%)`,border:`1px solid ${verd.col}44`,borderRadius:10,padding:"14px 18px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{flex:1,minWidth:220}}>
            <div style={{color:"#2E4060",fontSize:7,letterSpacing:3,marginBottom:5}}>SYNTHESIZED CYCLE VERDICT · {verd.active} SIGNALS ACTIVE</div>
            <div style={{fontSize:20,fontWeight:700,color:verd.col}}>{verd.phase}</div>
            <div style={{color:"#526880",fontSize:8,marginTop:5,maxWidth:520,lineHeight:1.65}}>{verd.desc}</div>
          </div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[
              {l:"POSITIONING",v:verd.risk,c:verd.col},
              {l:"MVRV-Z",v:onChain?.mvrvZ!=null?onChain.mvrvZ.toFixed(2):"—",c:mz.col},
              {l:"NUPL",v:nz.band,c:nz.col},
              {l:"SOPR",v:sopr!=null?sopr.toFixed(3):"—",c:sz.col},
              {l:"FUNDING",v:funding?.aggregate!=null?`${funding.aggregate.toFixed(3)}%`:"—",c:fz.col},
              {l:"NETFLOW",v:nf.composite!=null?(nf.composite>0?"INFLOW":"OUTFLOW"):"—",c:nf.col},
              {l:"BTC DOM",v:dom?`${dom.toFixed(1)}%`:"—",c:"#F7931A"},
            ].map(m=><div key={m.l} style={{textAlign:"center"}}><div style={{color:"#2E4060",fontSize:6,letterSpacing:1.5,marginBottom:3}}>{m.l}</div><div style={{color:m.c,fontSize:12,fontWeight:700,fontFamily:"monospace"}}>{m.v}</div></div>)}
          </div>
        </div>
        {latestAlert&&(
          <div onClick={()=>setPanel("alerts")} style={{marginTop:10,padding:"6px 10px",background:"#080E1C",borderRadius:5,border:"1px solid #182035",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <span style={{color:latestAlert.sev==="critical"?"#FF4455":latestAlert.sev==="warning"?"#FF8C42":"#7DEFA1",fontSize:8,fontWeight:700,letterSpacing:1.5}}>⚡ LATEST ALERT</span>
            <span style={{color:"#7A98B8",fontSize:8,flex:1}}>{latestAlert.msg}</span>
            <span style={{color:"#2E4060",fontSize:7}}>{new Date(latestAlert.ts).toLocaleString("en-US",{hour12:false})}</span>
          </div>
        )}
      </div>

      {panel==="overview"&&<Overview btc={btc} global={global} fg={fg} mempool={mempool} onChain={onChain} netflow={netflow} dxyVal={dxyVal} dxySrc={dxySrc} hrInfo={hrInfo} p7d={p7d} p30d={p30d} athPct={athPct} dom={dom} fgChart={fgChart}/>}
      {panel==="onchain"&&<OnChain onChain={onChain} hashD={hashD} mz={mz} nz={nz} sz={sz} hrInfo={hrInfo} sopr={sopr} puell={puell} pz={pz} addr={addr} az={az}/>}
      {panel==="derivs"&&<Derivatives funding={funding} fz={fz} netflow={netflow} nf={nf}/>}
      {panel==="macro"&&<Macro dxyVal={dxyVal} dxyKeyless={dxyKeyless} dxyLive={dxyLive} fredDXY={fredDXY} forex={forex} fredKey={fredKey} setFredKey={setFredKey} fetchFRED={fetchFRED} fredBusy={fredBusy} fredData={fredData}/>}
      {panel==="sectors"&&<Sectors sector={sector} tab={tab} setTab={setTab} defi={defi} verd={verd}/>}
      {panel==="signals"&&<Signals onChain={onChain} mz={mz} nz={nz} sz={sz} hrInfo={hrInfo} nf={nf} fg={fg} funding={funding} fz={fz} dom={dom} athPct={athPct} dxyVal={dxyVal} dxySrc={dxySrc} fredData={fredData} ycVal={ycVal} verd={verd} sopr={sopr} puell={puell} pz={pz} addr={addr} az={az}/>}
      {panel==="cycles"&&<Cycles overlay={overlay} verd={verd}/>}
      {panel==="alerts"&&<Alerts alerts={alerts} onClear={handleClearAlerts}/>}
      {panel==="keys"&&<ApiKeys fredKey={fredKey} setFredKey={setFredKey} fetchFRED={fetchFRED} fredBusy={fredBusy} fredData={fredData} apiKey={apiKey} setApiKey={setApiKey} fetchCoinAPI={fetchCoinAPI} apiBusy={apiBusy} dxyLive={dxyLive} defi={defi} funding={funding} mempool={mempool} dxyKeyless={dxyKeyless}/>}

      <div style={{color:"#182035",fontSize:7,textAlign:"center",marginTop:18,letterSpacing:2}}>CRYPTO CYCLE INTELLIGENCE v0.5 — 100% FREE DATA STACK — FOR RESEARCH ONLY — NOT FINANCIAL ADVICE</div>
    </div>
  );
}
