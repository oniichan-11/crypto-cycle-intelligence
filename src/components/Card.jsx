export default function Card({title,accent,style:s={},children}){
  return <div style={{
    background:"#FFFFFF",
    border:`1px solid ${accent?accent+"3D":"#E7EAF1"}`,
    borderRadius:12,
    padding:"16px 18px",
    boxShadow:"0 1px 2px rgba(23,27,36,0.04)",
    ...s
  }}>
    {title&&<div style={{color:"#8189A0",fontSize:11,fontWeight:600,letterSpacing:0.8,marginBottom:12}}>{title.toUpperCase()}</div>}
    {children}
  </div>;
}
