export default function Card({title,accent,style:s={},children}){
  return <div style={{background:"#0C1525",border:`1px solid ${accent?accent+"33":"#182035"}`,borderRadius:8,padding:"14px 16px",...s}}>
    {title&&<div style={{color:"#2E4060",fontFamily:"monospace",fontSize:7,letterSpacing:3,marginBottom:10}}>{title.toUpperCase()}</div>}
    {children}
  </div>;
}
