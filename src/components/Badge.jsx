// Signal-label → color map shared across the dashboard
export const BC={BULLISH:"#17A257","CAUTIOUS BULLISH":"#2E9E5B",BEARISH:"#E23A4E",CAUTION:"#D9720F",NEUTRAL:"#6B7484",PENDING:"#B4BAC6",ACCUMULATE:"#17A257",LIVE:"#17A257",FREE:"#17A257",PREMIUM:"#6B7484",UNAVAILABLE:"#C4CBD8","RISK-ON":"#2E9E5B",SELECTIVE:"#8A6100","SCALE OUT":"#D9720F",DEFENSIVE:"#E23A4E","EARLY CYCLE":"#8A6100","MID CYCLE":"#D9720F","LATE CYCLE":"#E23A4E","EARLY BULL":"#2E9E5B","MID BULL":"#8A6100","LATE BULL":"#D9720F",Capitulation:"#17A257",Hope:"#2E9E5B",Optimism:"#8A6100",Belief:"#D9720F",Euphoria:"#E23A4E",COMPUTED:"#2E9E5B",BLENDED:"#2E9E5B",OPTIONAL:"#6B7484",CONNECTING:"#8A6100",INFO:"#2E9E5B",WARNING:"#D9720F",CRITICAL:"#E23A4E"};

export default function Badge({label,col:c}){
  const color=c||BC[label]||"#6B7484";
  return <span style={{background:`${color}14`,color,border:`1px solid ${color}33`,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:600,letterSpacing:0.4,whiteSpace:"nowrap"}}>{label}</span>;
}
