export default function FGGauge({value}){
  const v=parseInt(value||50),pct=v/100;
  const col=v<=25?"#FF4455":v<=45?"#FF8C42":v<=55?"#FFB800":v<=75?"#7DEFA1":"#00C97A";
  const lbl=v<=25?"EXTREME FEAR":v<=45?"FEAR":v<=55?"NEUTRAL":v<=75?"GREED":"EXTREME GREED";
  const cx=60,cy=54,r=40,ex=cx+r*Math.cos(Math.PI-pct*Math.PI),ey=cy-r*Math.sin(Math.PI-pct*Math.PI),nx=cx+r*0.75*Math.cos(Math.PI-pct*Math.PI),ny=cy-r*0.75*Math.sin(Math.PI-pct*Math.PI);
  return<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
    <svg width="120" height="72" viewBox="0 0 120 72">
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="#1A2840" strokeWidth="9" strokeLinecap="round"/>
      {pct>0.01&&<path d={`M ${cx-r} ${cy} A ${r} ${r} 0 ${pct>0.5?1:0} 1 ${ex} ${ey}`} fill="none" stroke={col} strokeWidth="9" strokeLinecap="round"/>}
      {[0.25,0.5,0.75].map(t=>{const a=Math.PI-t*Math.PI;return<line key={t} x1={cx+(r-6)*Math.cos(a)} y1={cy-(r-6)*Math.sin(a)} x2={cx+(r+2)*Math.cos(a)} y2={cy-(r+2)*Math.sin(a)} stroke="#0C1525" strokeWidth="2"/>;})}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={col} strokeWidth="2" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="4" fill={col}/>
      <text x={cx} y={cy-10} textAnchor="middle" fill={col} fontSize="17" fontWeight="700" fontFamily="monospace">{v}</text>
    </svg>
    <span style={{color:col,fontSize:8,letterSpacing:2,fontWeight:700,fontFamily:"monospace"}}>{lbl}</span>
  </div>;
}
