import { Address } from 'viem';

/**
 * Liquidity Pools Configuration
 *
 * Concentrated liquidity pools on Lux AMM (Uniswap V3-style)
 * Reference: luxfi/amm contracts
 */

// ============================================================================
// POOL TYPES
// ============================================================================

export type PoolFee = 100 | 500 | 3000 | 10000; // 0.01%, 0.05%, 0.30%, 1.00%

export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface LiquidityPool {
  /** Pool contract address */
  address: Address;
  /** Token pair */
  token0: Token;
  token1: Token;
  /** Fee tier (in basis points * 100) */
  fee: PoolFee;
  /** Current tick */
  tick: number;
  /** Current sqrt price X96 */
  sqrtPriceX96: bigint;
  /** Total value locked in USD */
  tvlUSD: number;
  /** 24h volume in USD */
  volume24h: number;
  /** Annualized fee APY based on 24h volume */
  feeAPY: number;
  /** Liquidity provider rewards APY (if applicable) */
  rewardsAPY: number;
  /** Combined APY */
  totalAPY: number;
  /** Total liquidity */
  liquidity: bigint;
  /** Protocol (e.g., 'lux-amm') */
  protocol: string;
}

export interface UserPosition {
  /** NFT token ID for the position */
  tokenId: bigint;
  /** Pool address */
  poolAddress: Address;
  /** Position owner */
  owner: Address;
  /** Lower tick of position */
  tickLower: number;
  /** Upper tick of position */
  tickUpper: number;
  /** Liquidity in position */
  liquidity: bigint;
  /** Token0 amount */
  amount0: bigint;
  /** Token1 amount */
  amount1: bigint;
  /** Uncollected fees token0 */
  fees0: bigint;
  /** Uncollected fees token1 */
  fees1: bigint;
  /** Position value in USD */
  valueUSD: number;
  /** Is position in range */
  inRange: boolean;
}

export interface PoolStats {
  /** Pool address */
  poolAddress: Address;
  /** 24h volume */
  volume24h: number;
  /** 7d volume */
  volume7d: number;
  /** 24h fees collected */
  fees24h: number;
  /** TVL */
  tvl: number;
  /** Price of token0 in token1 */
  price: number;
  /** 24h price change percent */
  priceChange24h: number;
  /** Number of active positions */
  positionCount: number;
}

// ============================================================================
// SUPPORTED TOKENS
// ============================================================================

export const SUPPORTED_TOKENS: Record<string, Token> = {
  PARS: {
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9' as Address,
    symbol: 'PARS',
    name: 'PARS Token',
    decimals: 18,
    logoURI: '/images/coin-icon-pars.svg',
  },
  USDS: {
    address: '0x0000000000000000000000000000000000000001' as Address, // Placeholder
    symbol: 'USDS',
    name: 'USD Stablecoin',
    decimals: 18,
    logoURI: '/images/coin-icon-usdc.svg',
  },
  WETH: {
    address: '0x0000000000000000000000000000000000000002' as Address, // Placeholder
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logoURI: '/images/coin-icon-eth.svg',
  },
  USDC: {
    address: '0x0000000000000000000000000000000000000003' as Address, // Placeholder
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: '/images/coin-icon-usdc.svg',
  },
};

// ============================================================================
// POOL CONFIGURATIONS
// ============================================================================

export interface PoolConfig {
  token0: Token;
  token1: Token;
  fee: PoolFee;
  name: string;
  description: string;
  recommended: boolean;
}

export const POOL_CONFIGS: PoolConfig[] = [
  {
    token0: SUPPORTED_TOKENS.PARS,
    token1: SUPPORTED_TOKENS.USDS,
    fee: 3000,
    name: 'PARS-USDS',
    description: 'Core stablecoin pool for PARS liquidity',
    recommended: true,
  },
  {
    token0: SUPPORTED_TOKENS.PARS,
    token1: SUPPORTED_TOKENS.WETH,
    fee: 3000,
    name: 'PARS-WETH',
    description: 'ETH-denominated PARS trading pool',
    recommended: true,
  },
  {
    token0: SUPPORTED_TOKENS.PARS,
    token1: SUPPORTED_TOKENS.USDC,
    fee: 500,
    name: 'PARS-USDC',
    description: 'Low-fee USDC pool for larger trades',
    recommended: false,
  },
];

// ============================================================================
// AMM CONTRACT ADDRESSES (Lux AMM)
// ============================================================================

export interface AMMContracts {
  factory: Address;
  router: Address;
  positionManager: Address;
  quoter: Address;
  tickLens: Address;
}

export const AMM_CONTRACTS: Partial<AMMContracts> = {
  // To be populated after deployment on Lux
  // These follow the Uniswap V3 interface
};

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

export const MOCK_POOLS: LiquidityPool[] = [
  {
    address: '0x1111111111111111111111111111111111111111' as Address,
    token0: SUPPORTED_TOKENS.PARS,
    token1: SUPPORTED_TOKENS.USDS,
    fee: 3000,
    tick: 0,
    sqrtPriceX96: BigInt('79228162514264337593543950336'), // 1:1 price
    tvlUSD: 2_500_000,
    volume24h: 450_000,
    feeAPY: 0.0876, // 8.76%
    rewardsAPY: 0.0250, // 2.5% PARS rewards
    totalAPY: 0.1126, // 11.26%
    liquidity: BigInt('500000000000000000000000'),
    protocol: 'lux-amm',
  },
  {
    address: '0x2222222222222222222222222222222222222222' as Address,
    token0: SUPPORTED_TOKENS.PARS,
    token1: SUPPORTED_TOKENS.WETH,
    fee: 3000,
    tick: 0,
    sqrtPriceX96: BigInt('7922816251426433759354395033'),
    tvlUSD: 1_800_000,
    volume24h: 320_000,
    feeAPY: 0.0973, // 9.73%
    rewardsAPY: 0.0300, // 3% PARS rewards
    totalAPY: 0.1273, // 12.73%
    liquidity: BigInt('360000000000000000000000'),
    protocol: 'lux-amm',
  },
  {
    address: '0x3333333333333333333333333333333333333333' as Address,
    token0: SUPPORTED_TOKENS.PARS,
    token1: SUPPORTED_TOKENS.USDC,
    fee: 500,
    tick: 0,
    sqrtPriceX96: BigInt('79228162514264337593543950336'),
    tvlUSD: 950_000,
    volume24h: 180_000,
    feeAPY: 0.0346, // 3.46%
    rewardsAPY: 0.0150, // 1.5% PARS rewards
    totalAPY: 0.0496, // 4.96%
    liquidity: BigInt('190000000000000000000000'),
    protocol: 'lux-amm',
  },
];

export const MOCK_USER_POSITIONS: UserPosition[] = [
  {
    tokenId: BigInt(1),
    poolAddress: '0x1111111111111111111111111111111111111111' as Address,
    owner: '0x0000000000000000000000000000000000000000' as Address, // Will be replaced with user address
    tickLower: -887220,
    tickUpper: 887220,
    liquidity: BigInt('10000000000000000000000'),
    amount0: BigInt('5000000000000000000000'),
    amount1: BigInt('5000000000000000000000'),
    fees0: BigInt('50000000000000000000'),
    fees1: BigInt('45000000000000000000'),
    valueUSD: 10150,
    inRange: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function formatFeePercent(fee: PoolFee): string {
  return `${(fee / 10000).toFixed(2)}%`;
}

export function calculateAPYFromVolume(
  volume24h: number,
  tvl: number,
  fee: PoolFee,
): number {
  if (tvl === 0) return 0;
  const dailyFees = (volume24h * fee) / 1_000_000; // Fee is in basis points * 100
  const dailyReturn = dailyFees / tvl;
  return dailyReturn * 365; // Annualized
}

export function isPositionInRange(
  currentTick: number,
  tickLower: number,
  tickUpper: number,
): boolean {
  return currentTick >= tickLower && currentTick < tickUpper;
}

export function getPoolName(pool: LiquidityPool): string {
  return `${pool.token0.symbol}-${pool.token1.symbol}`;
}

export function getPoolFeeDisplay(fee: PoolFee): string {
  switch (fee) {
    case 100:
      return '0.01%';
    case 500:
      return '0.05%';
    case 3000:
      return '0.30%';
    case 10000:
      return '1.00%';
    default:
      return `${fee / 10000}%`;
  }
}
