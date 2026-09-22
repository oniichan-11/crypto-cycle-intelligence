export default function MiniBar({val,min,max,col}){
  const p=Math.max(0,Math.min(1,(val-min)/(max-min)));
  return <div style={{background:"#EEF1F6",borderRadius:99,height:6,overflow:"hidden"}}>
    <div style={{background:col,height:"100%",width:`${p*100}%`,borderRadius:99,transition:"width 0.8s"}}/>
  </div>;
}
