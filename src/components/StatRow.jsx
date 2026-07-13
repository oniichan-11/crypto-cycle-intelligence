// "SR" in the original single-file version
export default function StatRow({label,value,col,sub}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"4px 0",borderBottom:"1px solid #10182812"}}>
    <span style={{color:"#2E4060",fontSize:8,fontFamily:"monospace"}}>{label}</span>
    <div style={{textAlign:"right"}}>
      <span style={{color:col||"#9BB8D8",fontSize:10,fontFamily:"monospace",fontWeight:700}}>{value}</span>
      {sub&&<div style={{color:"#2E4060",fontSize:7}}>{sub}</div>}
    </div>
  </div>;
}
