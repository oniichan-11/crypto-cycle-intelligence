import { useState, useEffect } from "react";

// Isolated so the 1-second tick re-renders only this text, not the whole app
// (the original artifact re-rendered every chart every second).
export default function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{now.toLocaleTimeString("en-US", { hour12: false })} UTC</>;
}
