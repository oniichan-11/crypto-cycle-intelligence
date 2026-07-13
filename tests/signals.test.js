import { describe, it, expect } from "vitest";
import { mean, stdDev, movAvg } from "../src/lib/math.js";
import { mvrvZone, nuplZone, soprZone, hrZone, fundingZone, netflowZone, puellZone, addrZone } from "../src/lib/signals.js";
import { verdict } from "../src/lib/verdict.js";
import { computeDxy, DXY_BASKET, DXY_SCALAR } from "../src/lib/dxy.js";
import { buildSnapshot, evaluateAlerts } from "../src/lib/alerts.js";
import { buildCycleOverlay, HALVINGS } from "../src/lib/cycles.js";

// Realistic mid-2025 "units per USD" quotes, as returned by ECB/Frankfurter & CoinAPI
const REALISTIC_RATES = { EUR: 0.92, JPY: 155.2, GBP: 0.79, CAD: 1.36, SEK: 10.45, CHF: 0.88 };

describe("DXY (§7 bug fix — EUR/GBP inversion)", () => {
  it("computes a sane index (~100-107) from realistic units-per-USD quotes", () => {
    const dxy = computeDxy(REALISTIC_RATES);
    expect(dxy).toBeGreaterThan(95);
    expect(dxy).toBeLessThan(112);
  });
  it("would inflate to ~120 WITHOUT the invert fix (regression guard)", () => {
    // Reproduce the pre-fix (buggy) computation: no inversion of EUR/GBP
    let buggy = DXY_SCALAR;
    DXY_BASKET.forEach(({ id, weight }) => { buggy *= Math.pow(REALISTIC_RATES[id], weight); });
    const fixed = computeDxy(REALISTIC_RATES);
    expect(buggy).toBeGreaterThan(115);       // the bug symptom
    expect(fixed).toBeLessThan(buggy - 8);    // fix materially deflates it
  });
  it("stronger dollar (more units per USD) → higher index", () => {
    const stronger = computeDxy({ ...REALISTIC_RATES, EUR: 0.99, GBP: 0.85, JPY: 160 });
    expect(stronger).toBeGreaterThan(computeDxy(REALISTIC_RATES));
  });
  it("returns null when fewer than 4 pairs are present", () => {
    expect(computeDxy({ EUR: 0.92, JPY: 155 })).toBeNull();
    expect(computeDxy(null)).toBeNull();
    expect(computeDxy({})).toBeNull();
  });
});

describe("math helpers", () => {
  it("mean handles empty arrays", () => expect(mean([])).toBe(0));
  it("stdDev of constant series is 0", () => expect(stdDev([5, 5, 5])).toBe(0));
  it("movAvg pads with nulls until window fills", () => {
    expect(movAvg([1, 2, 3, 4], 3)).toEqual([null, null, 2, 3]);
  });
});

describe("signal zones — null resilience (never crash on missing data)", () => {
  it("all zones return PENDING/— shape on null", () => {
    expect(mvrvZone(null).sig).toBe("PENDING");
    expect(nuplZone(null).band).toBe("—");
    expect(soprZone(null).sig).toBe("PENDING");
    expect(hrZone(null, null).diff).toBeNull();
    expect(fundingZone(null).sig).toBe("PENDING");
    expect(netflowZone(null, null).composite).toBeNull();
  });
});

describe("signal zones — boundaries", () => {
  it("MVRV-Z bands", () => {
    expect(mvrvZone(-0.5).sig).toBe("ACCUMULATE");
    expect(mvrvZone(0.5).sig).toBe("BULLISH");
    expect(mvrvZone(2.5).sig).toBe("CAUTION");
    expect(mvrvZone(4).sig).toBe("BEARISH");
  });
  it("NUPL bands map to holder-emotion doctrine", () => {
    expect(nuplZone(-0.1).band).toBe("Capitulation");
    expect(nuplZone(0.3).band).toBe("Optimism");
    expect(nuplZone(0.8).band).toBe("Euphoria");
  });
  it("SOPR 1.0 pivot", () => {
    expect(soprZone(0.99).sig).toBe("CAUTIOUS BULLISH");
    expect(soprZone(1.01).sig).toBe("NEUTRAL");
    expect(soprZone(1.06).sig).toBe("BEARISH");
  });
  it("funding extremes", () => {
    expect(fundingZone(-0.02).sig).toBe("BULLISH");
    expect(fundingZone(0.12).sig).toBe("BEARISH");
  });
  it("Puell Multiple bands (incl. null)", () => {
    expect(puellZone(null).sig).toBe("PENDING");
    expect(puellZone(0.3).sig).toBe("ACCUMULATE");
    expect(puellZone(1.5).sig).toBe("NEUTRAL");
    expect(puellZone(4.5).sig).toBe("BEARISH");
  });
  it("address-activity growth bands (incl. null)", () => {
    expect(addrZone(null).sig).toBe("PENDING");
    expect(addrZone(12).sig).toBe("BULLISH");
    expect(addrZone(-15).sig).toBe("BEARISH");
  });
  it("netflow blend (3 legs): all bullish → BULLISH, split → partial", () => {
    expect(netflowZone(1.5, -0.5, -800).sig).toBe("BULLISH");     // stables up, exch balance down, net outflow
    expect(netflowZone(1.5, 0.5, 900).composite).toBeCloseTo(-1/3); // one bullish, two bearish
    expect(netflowZone(-1.5, 0.5, 900).sig).toBe("BEARISH");
    expect(netflowZone(2.0, null, null).composite).toBe(1);        // partial data still scores
    expect(netflowZone(null, null, -500).composite).toBe(1);       // flow-only leg works
    expect(netflowZone(null, null, null).composite).toBeNull();
  });
});

describe("verdict engine", () => {
  const fg = v => [{ value: String(v) }];
  it("returns SYNCING with no data", () => {
    expect(verdict({}).phase).toBe("SYNCING DATA");
  });
  it("deep-value inputs → accumulation posture", () => {
    const v = verdict({ fg: fg(15), dom: 60, athPct: -75, p7d: 0, p30d: 0, mvrvZ: -0.5, nupl: -0.05, sopr: 0.93, hrDiff: 3, funding: -0.02, netflow: 1, dxy: 96, yc: 0.5 });
    expect(["DEEP ACCUMULATION", "EARLY BULL"]).toContain(v.phase);
  });
  it("euphoria inputs → distribution posture", () => {
    const v = verdict({ fg: fg(90), dom: 42, athPct: -2, p7d: 20, p30d: 40, mvrvZ: 6, nupl: 0.8, sopr: 1.08, hrDiff: -3, funding: 0.15, netflow: -1, dxy: 108, yc: -0.5 });
    expect(["LATE BULL / CAUTION", "DISTRIBUTION / BEAR"]).toContain(v.phase);
  });
  it("survives partial signals (nulls) without crashing", () => {
    const v = verdict({ fg: fg(50), dom: 55, athPct: -30, p7d: 1, p30d: 2, mvrvZ: null, nupl: null, sopr: null, hrDiff: null, funding: null, netflow: null, dxy: null, yc: null });
    expect(v.phase).toBeTruthy();
    expect(v.active).toBeGreaterThan(0);
  });
});

describe("cycle backtesting overlay", () => {
  // Synthetic daily price series 2016-01-01 → 2026-07-01: price = 100 + days/10
  const makePrices = () => {
    const out = [], start = new Date("2016-01-01T00:00:00Z").getTime(), end = new Date("2026-07-01T00:00:00Z").getTime();
    for (let t = start, i = 0; t <= end; t += 86400000, i++) out.push({ date: new Date(t).toISOString().slice(0,10), p: 100 + i/10 });
    return out;
  };
  it("returns null on insufficient data", () => {
    expect(buildCycleOverlay(null)).toBeNull();
    expect(buildCycleOverlay([{date:"2024-01-01",p:1}])).toBeNull();
  });
  it("normalizes each cycle to 100 at its halving day", () => {
    const o = buildCycleOverlay(makePrices());
    expect(o).not.toBeNull();
    const day0 = o.series.find(r => r.day === 0);
    for (const h of HALVINGS) expect(day0["c"+h.label]).toBeCloseTo(100, 0);
  });
  it("rising synthetic series → later days above 100 and stats populated", () => {
    const o = buildCycleOverlay(makePrices());
    const day365 = o.series.find(r => r.day === 364);
    expect(day365.c2016).toBeGreaterThan(100);
    expect(o.stats.curDay).toBeGreaterThan(0);
    expect(o.stats.cycles.length).toBe(3);
    const c2016 = o.stats.cycles.find(c=>c.label==="2016");
    expect(c2016.peakMult).toBeGreaterThan(1); // monotonic series peaks at window end
  });
});

describe("alerting layer — fires on crosses only", () => {
  const base = { mvrvZ: 1.5, nupl: 0.4, sopr: 1.01, hrDiff: 1, funding: 0.02, netflow: 0.5, fg: 50, dxy: 102, phase: "MID BULL" };
  const snap = o => buildSnapshot({ ...base, ...o });

  it("no alerts when nothing crossed", () => {
    expect(evaluateAlerts(snap({}), snap({ mvrvZ: 1.6 }))).toHaveLength(0);
  });
  it("MVRV-Z crossing above 3 fires critical", () => {
    const fired = evaluateAlerts(snap({ mvrvZ: 2.9 }), snap({ mvrvZ: 3.1 }));
    expect(fired.some(a => a.id === "mvrvz-up-3" && a.sev === "critical")).toBe(true);
  });
  it("NUPL entering Euphoria fires critical", () => {
    const fired = evaluateAlerts(snap({ nupl: 0.72 }), snap({ nupl: 0.76 }));
    expect(fired.some(a => a.id === "nupl-euphoria")).toBe(true);
  });
  it("SOPR losing 1.0 fires warning", () => {
    const fired = evaluateAlerts(snap({ sopr: 1.005 }), snap({ sopr: 0.995 }));
    expect(fired.some(a => a.id === "sopr-down-1")).toBe(true);
  });
  it("netflow sign flip fires", () => {
    const fired = evaluateAlerts(snap({ netflow: 0.5 }), snap({ netflow: -0.5 }));
    expect(fired.some(a => a.id === "netflow-flip")).toBe(true);
  });
  it("phase change fires, but not from SYNCING DATA", () => {
    expect(evaluateAlerts(snap({ phase: "MID BULL" }), snap({ phase: "LATE BULL / CAUTION" })).some(a => a.id === "phase-change")).toBe(true);
    expect(evaluateAlerts(snap({ phase: "SYNCING DATA" }), snap({ phase: "MID BULL" })).some(a => a.id === "phase-change")).toBe(false);
  });
  it("null-heavy snapshots never fire or crash", () => {
    const empty = buildSnapshot({ mvrvZ: null, nupl: null, sopr: null, hrDiff: null, funding: null, netflow: null, fg: null, dxy: null, phase: null });
    expect(evaluateAlerts(empty, snap({}))).toHaveLength(0);
    expect(evaluateAlerts(null, snap({}))).toHaveLength(0);
  });
});
