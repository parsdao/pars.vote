import { Address } from 'viem';

/**
 * Lending Markets Type Definitions
 *
 * Based on OlympusDAO/Dolomite/Frax lending patterns
 * Wired to Lux liquid contracts for collateral
 */

// ============================================================================
// LENDING MARKET TYPES
// ============================================================================

export type LendingProtocol = 'lux-liquid' | 'fraxlend' | 'dolomite' | 'aave';

export type AssetType = 'native' | 'lsd' | 'stablecoin' | 'governance' | 'lp';

export interface Asset {
  symbol: string;
  name: string;
  address: Address | null; // null for native assets
  decimals: number;
  type: AssetType;
  icon?: string;
  priceOracle?: Address;
}

export interface LendingMarket {
  /** Unique market identifier */
  id: string;
  /** Protocol providing the market */
  protocol: LendingProtocol;
  /** Collateral asset */
  collateral: Asset;
  /** Borrow asset */
  borrowAsset: Asset;
  /** Supply APY (annualized) */
  supplyAPY: number;
  /** Borrow APY (annualized) */
  borrowAPY: number;
  /** Total Value Locked (in USD) */
  tvlUSD: number;
  /** Total supplied (in asset units) */
  totalSupplied: bigint;
  /** Total borrowed (in asset units) */
  totalBorrowed: bigint;
  /** Available to borrow (in asset units) */
  availableToBorrow: bigint;
  /** Utilization rate (0-1) */
  utilizationRate: number;
  /** Loan-to-Value ratio (0-1) */
  ltv: number;
  /** Liquidation threshold (0-1) */
  liquidationThreshold: number;
  /** Liquidation penalty (0-1) */
  liquidationPenalty: number;
  /** Market contract address */
  marketAddress: Address;
  /** Is market active */
  isActive: boolean;
  /** Is market paused */
  isPaused: boolean;
  /** Shariah compliant */
  shariahCompliant: boolean;
  /** Shariah notes if compliant */
  shariahNotes?: string;
}

export interface UserLendingPosition {
  /** Market reference */
  marketId: string;
  /** Collateral deposited (in asset units) */
  collateralDeposited: bigint;
  /** Collateral value (in USD) */
  collateralValueUSD: number;
  /** Amount borrowed (in asset units) */
  borrowed: bigint;
  /** Borrowed value (in USD) */
  borrowedValueUSD: number;
  /** Current health factor */
  healthFactor: number;
  /** Is position at risk of liquidation */
  isAtRisk: boolean;
  /** Earned interest (supply side) */
  earnedInterest: bigint;
  /** Accrued interest (borrow side) */
  accruedInterest: bigint;
}

export interface LendingStats {
  /** Total TVL across all markets (USD) */
  totalTVL: number;
  /** Total borrowed across all markets (USD) */
  totalBorrowed: number;
  /** Total supply interest earned (USD) */
  totalSupplyInterest: number;
  /** Number of active markets */
  activeMarkets: number;
  /** Number of unique suppliers */
  uniqueSuppliers: number;
  /** Number of unique borrowers */
  uniqueBorrowers: number;
}

// ============================================================================
// PREDEFINED ASSETS
// ============================================================================

export const LENDING_ASSETS: Record<string, Asset> = {
  // Native / LSD
  LUX: {
    symbol: 'LUX',
    name: 'Lux',
    address: null,
    decimals: 18,
    type: 'native',
  },
  stLUX: {
    symbol: 'stLUX',
    name: 'Staked Lux',
    address: '0x0000000000000000000000000000000000000001' as Address, // Placeholder
    decimals: 18,
    type: 'lsd',
  },
  wLUX: {
    symbol: 'wLUX',
    name: 'Wrapped Lux',
    address: '0x0000000000000000000000000000000000000002' as Address, // Placeholder
    decimals: 18,
    type: 'native',
  },

  // Governance
  PARS: {
    symbol: 'PARS',
    name: 'Pars',
    address: '0x0000000000000000000000000000000000000003' as Address, // Placeholder
    decimals: 18,
    type: 'governance',
  },
  xPARS: {
    symbol: 'xPARS',
    name: 'LiquidPARS',
    address: '0x0000000000000000000000000000000000000004' as Address, // Placeholder
    decimals: 18,
    type: 'governance',
  },
  CYRUS: {
    symbol: 'CYRUS',
    name: 'Cyrus',
    address: '0x0000000000000000000000000000000000000005' as Address, // Placeholder
    decimals: 18,
    type: 'governance',
  },

  // Stablecoins
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x0000000000000000000000000000000000000006' as Address, // Placeholder
    decimals: 6,
    type: 'stablecoin',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x0000000000000000000000000000000000000007' as Address, // Placeholder
    decimals: 6,
    type: 'stablecoin',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai',
    address: '0x0000000000000000000000000000000000000008' as Address, // Placeholder
    decimals: 18,
    type: 'stablecoin',
  },

  // LP Tokens
  'PARS-LUX-LP': {
    symbol: 'PARS-LUX-LP',
    name: 'PARS-LUX LP',
    address: '0x0000000000000000000000000000000000000009' as Address, // Placeholder
    decimals: 18,
    type: 'lp',
  },
};

// ============================================================================
// MOCK LENDING MARKETS (To be replaced with on-chain data)
// ============================================================================

export const MOCK_LENDING_MARKETS: LendingMarket[] = [
  {
    id: 'lux-stlux-usdc',
    protocol: 'lux-liquid',
    collateral: LENDING_ASSETS.stLUX,
    borrowAsset: LENDING_ASSETS.USDC,
    supplyAPY: 0.042,
    borrowAPY: 0.068,
    tvlUSD: 12_500_000,
    totalSupplied: 5_000_000n * 10n ** 18n,
    totalBorrowed: 3_200_000n * 10n ** 6n,
    availableToBorrow: 1_800_000n * 10n ** 6n,
    utilizationRate: 0.64,
    ltv: 0.75,
    liquidationThreshold: 0.82,
    liquidationPenalty: 0.05,
    marketAddress: '0x1111111111111111111111111111111111111111' as Address,
    isActive: true,
    isPaused: false,
    shariahCompliant: true,
    shariahNotes: 'Fee-based lending (ijara), no riba',
  },
  {
    id: 'lux-pars-usdc',
    protocol: 'lux-liquid',
    collateral: LENDING_ASSETS.PARS,
    borrowAsset: LENDING_ASSETS.USDC,
    supplyAPY: 0.035,
    borrowAPY: 0.072,
    tvlUSD: 8_200_000,
    totalSupplied: 15_000_000n * 10n ** 18n,
    totalBorrowed: 2_100_000n * 10n ** 6n,
    availableToBorrow: 4_500_000n * 10n ** 6n,
    utilizationRate: 0.32,
    ltv: 0.65,
    liquidationThreshold: 0.75,
    liquidationPenalty: 0.08,
    marketAddress: '0x2222222222222222222222222222222222222222' as Address,
    isActive: true,
    isPaused: false,
    shariahCompliant: true,
    shariahNotes: 'Governance token collateral, fee-only',
  },
  {
    id: 'lux-xpars-dai',
    protocol: 'lux-liquid',
    collateral: LENDING_ASSETS.xPARS,
    borrowAsset: LENDING_ASSETS.DAI,
    supplyAPY: 0.048,
    borrowAPY: 0.075,
    tvlUSD: 5_600_000,
    totalSupplied: 8_000_000n * 10n ** 18n,
    totalBorrowed: 1_400_000n * 10n ** 18n,
    availableToBorrow: 2_800_000n * 10n ** 18n,
    utilizationRate: 0.33,
    ltv: 0.70,
    liquidationThreshold: 0.78,
    liquidationPenalty: 0.06,
    marketAddress: '0x3333333333333333333333333333333333333333' as Address,
    isActive: true,
    isPaused: false,
    shariahCompliant: true,
    shariahNotes: 'Yield-bearing collateral, mudarabah-style',
  },
  {
    id: 'lux-wlux-usdt',
    protocol: 'lux-liquid',
    collateral: LENDING_ASSETS.wLUX,
    borrowAsset: LENDING_ASSETS.USDT,
    supplyAPY: 0.039,
    borrowAPY: 0.065,
    tvlUSD: 18_400_000,
    totalSupplied: 12_000_000n * 10n ** 18n,
    totalBorrowed: 8_500_000n * 10n ** 6n,
    availableToBorrow: 3_400_000n * 10n ** 6n,
    utilizationRate: 0.71,
    ltv: 0.80,
    liquidationThreshold: 0.85,
    liquidationPenalty: 0.04,
    marketAddress: '0x4444444444444444444444444444444444444444' as Address,
    isActive: true,
    isPaused: false,
    shariahCompliant: true,
    shariahNotes: 'Native asset, service fee model',
  },
  {
    id: 'lux-lp-usdc',
    protocol: 'lux-liquid',
    collateral: LENDING_ASSETS['PARS-LUX-LP'],
    borrowAsset: LENDING_ASSETS.USDC,
    supplyAPY: 0.062,
    borrowAPY: 0.095,
    tvlUSD: 3_200_000,
    totalSupplied: 2_000_000n * 10n ** 18n,
    totalBorrowed: 1_600_000n * 10n ** 6n,
    availableToBorrow: 1_100_000n * 10n ** 6n,
    utilizationRate: 0.59,
    ltv: 0.60,
    liquidationThreshold: 0.70,
    liquidationPenalty: 0.10,
    marketAddress: '0x5555555555555555555555555555555555555555' as Address,
    isActive: true,
    isPaused: false,
    shariahCompliant: true,
    shariahNotes: 'LP collateral, profit-sharing structure',
  },
  {
    id: 'lux-cyrus-dai',
    protocol: 'lux-liquid',
    collateral: LENDING_ASSETS.CYRUS,
    borrowAsset: LENDING_ASSETS.DAI,
    supplyAPY: 0.028,
    borrowAPY: 0.058,
    tvlUSD: 2_100_000,
    totalSupplied: 25_000_000n * 10n ** 18n,
    totalBorrowed: 800_000n * 10n ** 18n,
    availableToBorrow: 1_500_000n * 10n ** 18n,
    utilizationRate: 0.35,
    ltv: 0.55,
    liquidationThreshold: 0.65,
    liquidationPenalty: 0.12,
    marketAddress: '0x6666666666666666666666666666666666666666' as Address,
    isActive: true,
    isPaused: false,
    shariahCompliant: true,
    shariahNotes: 'Utility token collateral',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function formatAPY(apy: number): string {
  return `${(apy * 100).toFixed(2)}%`;
}

export function formatTVL(tvlUSD: number): string {
  if (tvlUSD >= 1_000_000_000) {
    return `$${(tvlUSD / 1_000_000_000).toFixed(2)}B`;
  }
  if (tvlUSD >= 1_000_000) {
    return `$${(tvlUSD / 1_000_000).toFixed(2)}M`;
  }
  if (tvlUSD >= 1_000) {
    return `$${(tvlUSD / 1_000).toFixed(2)}K`;
  }
  return `$${tvlUSD.toFixed(2)}`;
}

export function formatUtilization(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function getHealthFactorColor(healthFactor: number): string {
  if (healthFactor >= 2) return 'green.400';
  if (healthFactor >= 1.5) return 'yellow.400';
  if (healthFactor >= 1.1) return 'orange.400';
  return 'red.400';
}

export function getHealthFactorLabel(healthFactor: number): string {
  if (healthFactor >= 2) return 'Healthy';
  if (healthFactor >= 1.5) return 'Moderate';
  if (healthFactor >= 1.1) return 'At Risk';
  return 'Danger';
}
