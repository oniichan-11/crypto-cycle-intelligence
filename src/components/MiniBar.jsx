export default function MiniBar({val,min,max,col}){
  const p=Math.max(0,Math.min(1,(val-min)/(max-min)));
  return <div style={{background:"#080E1C",borderRadius:3,height:4,overflow:"hidden"}}>
    <div style={{background:col,height:"100%",width:`${p*100}%`,borderRadius:3,transition:"width 0.8s"}}/>
  </div>;
}
