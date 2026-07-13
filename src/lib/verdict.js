// ─── CYCLE VERDICT ───────────────────────────────────────────────────────────
// Weighted scoring engine — Tier 1 on-chain (MVRV-Z, NUPL) weighted 2× (±4 vs ±2).
export function verdict(s){
  if(!s.fg||!s.dom) return{phase:"SYNCING DATA",col:"#3D5070",risk:"—",desc:"Connecting...",score:0,active:0};
  const fgv=parseInt(s.fg[0]?.value||50); let score=0,n=0; const add=v=>{score+=v;n++;};
  if(fgv<=20)add(3);else if(fgv<=40)add(2);else if(fgv<=55)add(0);else if(fgv<=75)add(-1);else add(-3);
  if(s.athPct<-70)add(3);else if(s.athPct<-40)add(2);else if(s.athPct<-20)add(0);else if(s.athPct<-10)add(-1);else add(-2);
  if(s.p7d>10&&s.p30d>20)add(1);else if(s.p7d<-15&&s.p30d<-25)add(-1);else add(0);
  if(s.mvrvZ!=null){if(s.mvrvZ<0)add(4);else if(s.mvrvZ<1)add(2);else if(s.mvrvZ<2)add(0);else if(s.mvrvZ<3)add(-2);else add(-4);}
  if(s.nupl!=null){if(s.nupl<0)add(4);else if(s.nupl<0.25)add(2);else if(s.nupl<0.5)add(0);else if(s.nupl<0.75)add(-2);else add(-4);}
  if(s.sopr!=null){if(s.sopr<0.95)add(2);else if(s.sopr<1)add(1);else if(s.sopr<1.02)add(0);else if(s.sopr<1.05)add(-1);else add(-2);}
  if(s.hrDiff!=null){if(s.hrDiff>2)add(2);else if(s.hrDiff>0)add(1);else if(s.hrDiff>-2)add(-1);else add(-2);}
  if(s.funding!=null){if(s.funding<-0.01)add(2);else if(s.funding<0.01)add(0);else if(s.funding<0.05)add(-1);else add(-2);}
  if(s.netflow!=null){add(s.netflow*2);}
  if(s.yc!=null)score+=s.yc>0?1:-1;
  if(s.dxy!=null)score+=s.dxy<100?1:-1;
  const ps=n>0?score/n:0;
  const dCtx=s.dom>58?"BTC dominance high — alt rotation not yet started":s.dom>48?"Rotation underway — mid-cycle":"Alt season conditions — late-cycle risk elevated";
  if(ps>=2.5)return{phase:"DEEP ACCUMULATION",col:"#00C97A",risk:"AGGRESSIVE LONG",desc:`Maximum on-chain conviction. ${dCtx}. Stage entries BTC → ETH → L1s.`,score,active:n};
  if(ps>=1.2)return{phase:"EARLY BULL",col:"#7DEFA1",risk:"RISK-ON",desc:`On-chain bullish, sentiment recovering. ${dCtx}. Full risk-on across core sectors.`,score,active:n};
  if(ps>=0.2)return{phase:"MID BULL",col:"#FFB800",risk:"SELECTIVE",desc:`Expansion underway. ${dCtx}. Hold core, selective rotation, watch NUPL & funding.`,score,active:n};
  if(ps>=-1)return{phase:"LATE BULL / CAUTION",col:"#FF8C42",risk:"SCALE OUT",desc:`Euphoria building. ${dCtx}. Systematic profit-taking, cut leverage.`,score,active:n};
  return{phase:"DISTRIBUTION / BEAR",col:"#FF4455",risk:"DEFENSIVE",desc:`On-chain distribution. ${dCtx}. Capital preservation — stables/cash.`,score,active:n};
}
