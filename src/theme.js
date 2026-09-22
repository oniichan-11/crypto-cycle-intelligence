// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
// Light UI, modeled on cryptorank.io's information density and legibility:
// white/near-white surfaces, thin low-contrast borders (no shadows), Inter
// throughout with tabular-nums for data, and deep semantic red/green tuned
// for AA contrast on white rather than cryptorank's brighter dark-mode-first
// hues. The brand accent (Bitcoin orange) is kept — it's this product's own
// identity, not cryptorank's blue, and it reads just as well on light ground.
//
// This file is the source of truth for new code. Existing inline styles
// across components/panels were migrated to these same hex values directly
// (see git history) rather than importing this module everywhere, matching
// the codebase's existing inline-style-object convention.
export const T = {
  color: {
    bg:        "#F4F6FB", // page ground
    surface:   "#FFFFFF", // card surface
    inset:     "#F3F5F9", // nested tiles, table header rows
    border:    "#E4E8F0", // hairline borders / inactive chip bg
    faint:     "#C4CBD8", // extra-faint text, unfilled gauge track
    textFaint: "#6B7686", // eyebrow labels, captions (was #2E4060)
    textMuted: "#6B7484", // neutral/pending (was #3D5070)
    textSub:   "#55606E", // secondary text (was #526880)
    textTert:  "#626D7D", // tertiary text (was #7A98B8)
    text:      "#171B24", // primary text (was #9BB8D8)
    divider:   "#EDF0F5", // row dividers

    accent:    "#F7931A", // brand — unchanged across themes
    up:        "#17A257", // bullish (was #00C97A)
    upSoft:    "#2E9E5B", // cautious-bullish (was #7DEFA1)
    down:      "#E23A4E", // bearish (was #FF4455)
    warn:      "#D9720F", // caution (was #FF8C42)
    caution:   "#8A6100", // neutral-caution yellow (was #FFB800)

    dangerBg:  "#FDEEEE", // was #1A0800
    successBg: "#EEFBF3", // was #001A0C
  },
  font: {
    sans: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  },
  radius: { sm: 6, md: 10, lg: 14 },
};
