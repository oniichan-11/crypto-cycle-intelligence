// ─── SIGNAL INTERPRETERS ─────────────────────────────────────────────────────
export const mvrvZone = z => z==null?{label:"—",col:"#6B7484",sig:"PENDING"}:z<0?{label:"Deep undervalued — max buy",col:"#17A257",sig:"ACCUMULATE"}:z<1?{label:"Undervalued — accumulate",col:"#2E9E5B",sig:"BULLISH"}:z<2?{label:"Fair value — early bull",col:"#8A6100",sig:"NEUTRAL"}:z<3?{label:"Elevated — late bull",col:"#D9720F",sig:"CAUTION"}:{label:"Overvalued — distribution",col:"#E23A4E",sig:"BEARISH"};
export const nuplZone = n => n==null?{band:"—",label:"—",col:"#6B7484"}:n<0?{band:"Capitulation",label:"Extreme buy signal",col:"#17A257"}:n<0.25?{band:"Hope",label:"Early recovery",col:"#2E9E5B"}:n<0.5?{band:"Optimism",label:"Mid bull confirmed",col:"#8A6100"}:n<0.75?{band:"Belief",label:"Strong bull, alert",col:"#D9720F"}:{band:"Euphoria",label:"Systematic exit",col:"#E23A4E"};
export const soprZone = v => v==null?{label:"—",col:"#6B7484",sig:"PENDING"}:v<0.95?{label:"Capitulation selling",col:"#17A257",sig:"BULLISH"}:v<1?{label:"Selling at loss",col:"#2E9E5B",sig:"CAUTIOUS BULLISH"}:v<1.02?{label:"Mild profit taking",col:"#8A6100",sig:"NEUTRAL"}:v<1.05?{label:"Healthy profit taking",col:"#D9720F",sig:"CAUTION"}:{label:"Heavy profit realization",col:"#E23A4E",sig:"BEARISH"};
export const hrZone   = (m30,m60) => { if(!m30||!m60)return{label:"—",col:"#6B7484",sig:"PENDING",diff:null}; const d=((m30-m60)/m60)*100; return d>5?{label:`+${d.toFixed(1)}% — miner recovery`,col:"#17A257",sig:"BULLISH",diff:d}:d>0?{label:`+${d.toFixed(1)}% — stabilising`,col:"#2E9E5B",sig:"CAUTIOUS BULLISH",diff:d}:d>-5?{label:`${d.toFixed(1)}% — miner stress`,col:"#D9720F",sig:"CAUTION",diff:d}:{label:`${d.toFixed(1)}% — capitulation`,col:"#E23A4E",sig:"BEARISH",diff:d}; };
export const fundingZone = f => f==null?{label:"—",col:"#6B7484",sig:"PENDING"}:f<-0.01?{label:"Negative — shorts pay, fuel remains",col:"#17A257",sig:"BULLISH"}:f<0.01?{label:"Neutral — balanced positioning",col:"#2E9E5B",sig:"NEUTRAL"}:f<0.05?{label:"Positive — mild long bias",col:"#8A6100",sig:"NEUTRAL"}:f<0.1?{label:"Elevated — leverage building",col:"#D9720F",sig:"CAUTION"}:{label:"Extreme — flush risk high",col:"#E23A4E",sig:"BEARISH"};

export const puellZone = p => p==null?{label:"—",col:"#6B7484",sig:"PENDING"}:p<0.5?{label:"Miner capitulation — historic bottom zone",col:"#17A257",sig:"ACCUMULATE"}:p<1?{label:"Below-avg miner revenue — early cycle",col:"#2E9E5B",sig:"BULLISH"}:p<2?{label:"Normal miner revenue",col:"#8A6100",sig:"NEUTRAL"}:p<4?{label:"Elevated miner revenue — late cycle",col:"#D9720F",sig:"CAUTION"}:{label:"Extreme miner revenue — cycle top zone",col:"#E23A4E",sig:"BEARISH"};
export const addrZone = g => g==null?{label:"—",col:"#6B7484",sig:"PENDING"}:g>10?{label:"Strong network growth",col:"#17A257",sig:"BULLISH"}:g>0?{label:"Expanding participation",col:"#2E9E5B",sig:"CAUTIOUS BULLISH"}:g>-10?{label:"Cooling participation",col:"#D9720F",sig:"CAUTION"}:{label:"Contracting usage",col:"#E23A4E",sig:"BEARISH"};

// Blended netflow — now three legs (upgraded 2026-07-12 when CM freed exchange-flow metrics):
//   scChg   — stablecoin supply Δ 7d (DefiLlama): rising = dry powder entering = bullish
//   balChg  — REAL exchange balance Δ 7d (CM SplyExNtv): falling = accumulation off exchanges = bullish
//   flowNet — REAL net exchange flow, 7d mean BTC/day (CM FlowInExNtv − FlowOutExNtv): negative = outflow = bullish
export const netflowZone = (scChg, balChg, flowNet) => {
  if(scChg==null&&balChg==null&&flowNet==null) return { label:"—", col:"#6B7484", sig:"PENDING", composite:null };
  let score=0, n=0;
  if(scChg!=null){ score += scChg>0?1:-1; n++; }
  if(balChg!=null){ score += balChg<0?1:-1; n++; }
  if(flowNet!=null){ score += flowNet<0?1:-1; n++; }
  const composite = n>0?score/n:null;
  if(composite==null) return { label:"—", col:"#6B7484", sig:"PENDING", composite:null };
  if(composite>0.5)  return { label:"Capital entering, coins leaving exchanges", col:"#17A257", sig:"BULLISH", composite };
  if(composite>0)    return { label:"Mild inflow of liquidity", col:"#2E9E5B", sig:"CAUTIOUS BULLISH", composite };
  if(composite>-0.5) return { label:"Mild sell pressure", col:"#D9720F", sig:"CAUTION", composite };
  return               { label:"Capital exiting, coins to exchanges", col:"#E23A4E", sig:"BEARISH", composite };
};
