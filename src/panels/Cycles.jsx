import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";
import { fmt } from "../lib/math.js";

const CYCLE_COLORS = { c2016: "#3D5070", c2020: "#7DEFA1", c2024: "#F7931A" };

export default function Cycles({ overlay, verd }) {
  if (!overlay) return (
    <Card title="Cycle Backtesting Overlay">
      <div style={{color:"#2E4060",fontSize:9,padding:"24px 0",textAlign:"center"}}>Loading full price history from CoinMetrics (cached 12h after first load)...</div>
    </Card>
  );
  const { series, stats } = overlay;
  const prior = stats.cycles.filter(c => c.label !== "2024");
  const cur = stats.cycles.find(c => c.label === "2024");
  const avgTopDay = prior.length ? Math.round(prior.reduce((s,c)=>s+(c.peakDay||0),0)/prior.length) : null;
  const pastTopWindow = avgTopDay != null && stats.curDay > avgTopDay;

  return (
    <>
      <div style={{padding:"8px 12px",background:"#0C1525",borderRadius:6,border:"1px solid #182035",marginBottom:10}}>
        <span style={{color:"#526880",fontSize:8}}>
          Price normalized to <span style={{color:"#9BB8D8"}}>100 at each halving</span>, aligned by days-since-halving (log scale). Doctrine reminder: the halving is a <span style={{color:"#F7931A"}}>synchronization marker</span>, not a mechanical trigger — no two cycles are mirror images. Context, not prophecy.
        </span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:10}}>
        <Card title="Days Since 2024 Halving">
          <div style={{fontSize:26,fontWeight:700,color:"#F7931A",fontFamily:"monospace"}}>{stats.curDay}</div>
          <div style={{color:"#2E4060",fontSize:7,marginTop:4}}>Halving: {cur?.halving} · base ${fmt(cur?.base,0)}</div>
        </Card>
        <Card title="Current Multiple">
          <div style={{fontSize:26,fontWeight:700,color:"#9BB8D8",fontFamily:"monospace"}}>{stats.curMult?`${stats.curMult.toFixed(2)}×`:"—"}</div>
          <div style={{color:"#2E4060",fontSize:7,marginTop:4}}>vs halving-day price</div>
        </Card>
        {prior.map(c=>(
          <Card key={c.label} title={`${c.label} Cycle Top`}>
            <div style={{fontSize:26,fontWeight:700,color:CYCLE_COLORS["c"+c.label],fontFamily:"monospace"}}>{c.peakMult?`${c.peakMult.toFixed(1)}×`:"—"}</div>
            <div style={{color:"#2E4060",fontSize:7,marginTop:4}}>on day {c.peakDay} post-halving</div>
          </Card>
        ))}
      </div>

      <Card title="Price by Days Since Halving — 2016 vs 2020 vs 2024 (log)" style={{marginBottom:10}}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={series} margin={{top:8,right:12,bottom:0,left:-14}}>
            <XAxis dataKey="day" tick={{fill:"#2E4060",fontSize:7}} tickLine={false} axisLine={false} ticks={[0,182,365,547,730,912,1095,1277,1460]}/>
            <YAxis scale="log" domain={[40, "auto"]} allowDataOverflow tick={{fill:"#2E4060",fontSize:7}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/100).toFixed(v>=1000?0:1)}×`}/>
            <Tooltip contentStyle={{background:"#0C1525",border:"1px solid #182035",borderRadius:4,fontSize:8}} labelFormatter={d=>`Day ${d} post-halving`} formatter={(v,n)=>[`${(v/100).toFixed(2)}×`,n.replace("c","")]}/>
            <ReferenceLine y={100} stroke="#526880" strokeDasharray="2 4"/>
            <ReferenceLine x={stats.curDay} stroke="#FF4455" strokeDasharray="4 4" label={{value:"TODAY",fill:"#FF4455",fontSize:8,position:"top"}}/>
            <Line type="monotone" dataKey="c2016" stroke={CYCLE_COLORS.c2016} strokeWidth={1.5} dot={false} name="2016"/>
            <Line type="monotone" dataKey="c2020" stroke={CYCLE_COLORS.c2020} strokeWidth={1.5} dot={false} name="2020"/>
            <Line type="monotone" dataKey="c2024" stroke={CYCLE_COLORS.c2024} strokeWidth={2.5} dot={false} name="2024 (current)"/>
            <Legend iconType="line" wrapperStyle={{fontSize:8,color:"#526880"}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Cycle Context Read">
        <div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:260}}>
            <div style={{color:"#7A98B8",fontSize:9,lineHeight:1.8}}>
              Prior cycle tops landed on day <span style={{color:"#3D5070",fontWeight:700}}>{prior[0]?.peakDay}</span> ({prior[0]?.label}) and day <span style={{color:"#7DEFA1",fontWeight:700}}>{prior[1]?.peakDay}</span> ({prior[1]?.label}) — average ≈ day {avgTopDay}. Today is day <span style={{color:"#F7931A",fontWeight:700}}>{stats.curDay}</span>{pastTopWindow?" — PAST the historical top window; if the 4-year rhythm held, this is the post-peak/bear leg of the cycle.":" — still inside the historical pre-top window."}
            </div>
            <div style={{color:"#2E4060",fontSize:7,marginTop:8,lineHeight:1.7}}>
              Cross-check against the live verdict rather than the calendar: dynamic phase detection via on-chain + price structure outranks halving math (handoff §2, Layer 1).
            </div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{color:"#2E4060",fontSize:6,letterSpacing:1.5,marginBottom:4}}>LIVE VERDICT SAYS</div>
            <Badge label={verd.phase} col={verd.col}/>
          </div>
        </div>
      </Card>
    </>
  );
}
