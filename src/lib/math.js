// ─── MATH & FORMAT HELPERS ───────────────────────────────────────────────────
export const mean   = a => a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
export const stdDev = a => { const m=mean(a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length); };
export const movAvg = (a,n) => a.map((_,i,arr)=> i<n-1?null:mean(arr.slice(i-n+1,i+1)));
export const fmt    = (n,d=2) => n!=null&&!isNaN(n)?Number(n).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}):"—";
export const fmtBig = n => { if((!n&&n!==0)||isNaN(n))return"—"; const a=Math.abs(n); if(a>=1e12)return`$${(n/1e12).toFixed(2)}T`; if(a>=1e9)return`$${(n/1e9).toFixed(2)}B`; if(a>=1e6)return`$${(n/1e6).toFixed(2)}M`; if(a>=1e3)return`$${(n/1e3).toFixed(1)}K`; return`$${fmt(n,0)}`; };
export const fmtPct = n => n!=null&&!isNaN(n)?`${n>0?"+":""}${Number(n).toFixed(2)}%`:"—";
export const fmtP   = p => { if(p==null||isNaN(p))return"—"; if(p<0.001)return`$${p.toFixed(6)}`; if(p<0.01)return`$${p.toFixed(5)}`; if(p<1)return`$${p.toFixed(4)}`; if(p<10)return`$${p.toFixed(3)}`; return`$${fmt(p,2)}`; };
export const pCol   = (n,inv=false) => n==null?"#3D5070":(n>0)!==inv?"#00C97A":"#FF4455";
