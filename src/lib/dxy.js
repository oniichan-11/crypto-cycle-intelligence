// ─── DXY BASKET COMPUTATION ──────────────────────────────────────────────────
// CRITICAL (handoff §7): ECB/CoinAPI quote every currency as "units per USD",
// but the ICE DXY formula expects EUR & GBP as "USD per unit". Those two carry
// the largest negative weights, so they MUST be inverted before applying the
// exponent — otherwise the index inflates to ~120 and biases every verdict
// toward "strong dollar / risk-off".
export const DXY_BASKET = [
  { id:"EUR", weight:-0.576, invert:true,  label:"EUR/USD" },
  { id:"JPY", weight: 0.136, invert:false, label:"USD/JPY" },
  { id:"GBP", weight:-0.119, invert:true,  label:"GBP/USD" },
  { id:"CAD", weight: 0.091, invert:false, label:"USD/CAD" },
  { id:"SEK", weight: 0.042, invert:false, label:"USD/SEK" },
  { id:"CHF", weight: 0.036, invert:false, label:"USD/CHF" },
];
export const DXY_SCALAR = 50.14348112;

// rates: { EUR: units-per-USD, JPY: ..., ... } → DXY index value or null.
// Requires at least `minPairs` pairs present to produce a value.
export function computeDxy(rates, minPairs = 4) {
  if (!rates) return null;
  let dxy = DXY_SCALAR, n = 0;
  DXY_BASKET.forEach(({ id, weight, invert }) => {
    if (rates[id]) {
      const rate = invert ? (1 / rates[id]) : rates[id];
      dxy *= Math.pow(rate, weight);
      n++;
    }
  });
  return n >= minPairs ? +dxy.toFixed(2) : null;
}
