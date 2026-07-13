export const COINS = [
  { id:"bitcoin",     sym:"BTC",  sector:"L1"       },
  { id:"ethereum",    sym:"ETH",  sector:"L1"       },
  { id:"solana",      sym:"SOL",  sector:"L1"       },
  { id:"avalanche-2", sym:"AVAX", sector:"L1"       },
  { id:"arbitrum",    sym:"ARB",  sector:"L2"       },
  { id:"optimism",    sym:"OP",   sector:"L2"       },
  { id:"uniswap",     sym:"UNI",  sector:"DeFi"     },
  { id:"aave",        sym:"AAVE", sector:"DeFi"     },
  { id:"gmx",         sym:"GMX",  sector:"PerpDEX"  },
  { id:"dydx",        sym:"DYDX", sector:"PerpDEX"  },
  { id:"hyperliquid", sym:"HYPE", sector:"PerpDEX"  },
  { id:"render-token",sym:"RNDR", sector:"AI/DePIN" },
  { id:"artificial-superintelligence-alliance", sym:"FET", sector:"AI/DePIN" },
  { id:"helium",      sym:"HNT",  sector:"AI/DePIN" },
  { id:"bittensor",   sym:"TAO",  sector:"AI/DePIN" },
];

// Sector → DefiLlama protocol slugs (for TVL/fees)
export const SECTOR_PROTOCOLS = {
  DeFi:    ["uniswap","aave","curve-dex"],
  PerpDEX: ["gmx","dydx","hyperliquid"],
};

export const SECTOR_TABS = ["ALL","L1","L2","DeFi","PerpDEX","AI/DePIN"];
