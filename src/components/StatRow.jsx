// "SR" in the original single-file version
export default function StatRow({label,value,col,sub}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"4px 0",borderBottom:"1px solid #EDF0F5"}}>
    <span style={{color:"#6B7686",fontSize:12,fontFamily:"inherit"}}>{label}</span>
    <div style={{textAlign:"right"}}>
      <span style={{color:col||"#171B24",fontSize:14,fontFamily:"inherit",fontWeight:700}}>{value}</span>
      {sub&&<div style={{color:"#6B7686",fontSize:11}}>{sub}</div>}
    </div>
  </div>;
}
