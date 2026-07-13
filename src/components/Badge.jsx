// Signal-label → color map shared across the dashboard
export const BC={BULLISH:"#00C97A","CAUTIOUS BULLISH":"#7DEFA1",BEARISH:"#FF4455",CAUTION:"#FF8C42",NEUTRAL:"#3D5070",PENDING:"#2E4060",ACCUMULATE:"#00C97A",LIVE:"#00C97A",FREE:"#00C97A",PREMIUM:"#3D5070",UNAVAILABLE:"#1A2840","RISK-ON":"#7DEFA1",SELECTIVE:"#FFB800","SCALE OUT":"#FF8C42",DEFENSIVE:"#FF4455","EARLY CYCLE":"#FFB800","MID CYCLE":"#FF8C42","LATE CYCLE":"#FF4455","EARLY BULL":"#7DEFA1","MID BULL":"#FFB800","LATE BULL":"#FF8C42",Capitulation:"#00C97A",Hope:"#7DEFA1",Optimism:"#FFB800",Belief:"#FF8C42",Euphoria:"#FF4455",COMPUTED:"#7DEFA1",BLENDED:"#7DEFA1",OPTIONAL:"#3D5070",CONNECTING:"#FFB800",INFO:"#7DEFA1",WARNING:"#FF8C42",CRITICAL:"#FF4455"};

export default function Badge({label,col:c}){
  const color=c||BC[label]||"#3D5070";
  return <span style={{background:`${color}18`,color,border:`1px solid ${color}44`,padding:"2px 8px",borderRadius:3,fontSize:7,fontFamily:"monospace",fontWeight:700,letterSpacing:1.5,whiteSpace:"nowrap"}}>{label}</span>;
}
