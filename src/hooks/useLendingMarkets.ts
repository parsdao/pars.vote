import { useCallback, useMemo, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import {
  LendingMarket,
  UserLendingPosition,
  LendingStats,
  MOCK_LENDING_MARKETS,
} from '../types/lending';

// Lux Liquid Lending Pool ABI (ERC4626-based with lending extensions)
const LENDING_POOL_ABI = [
  // Supply side
  {
    name: 'deposit',
    type: 'function',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    name: 'withdraw',
    type: 'function',
    inputs: [
      { name: 'assets', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    outputs: [{ name: 'shares', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  // Borrow side
  {
    name: 'borrow',
    type: 'function',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'repay',
    type: 'function',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'borrower', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Collateral
  {
    name: 'depositCollateral',
    type: 'function',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'withdrawCollateral',
    type: 'function',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'receiver', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // View functions
  {
    name: 'totalAssets',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'totalBorrowed',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getSupplyAPY',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getBorrowAPY',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getUserCollateral',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getUserBorrowed',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getHealthFactor',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getLTV',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getLiquidationThreshold',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export interface UseLendingMarketsResult {
  /** All available lending markets */
  markets: LendingMarket[];
  /** User positions across markets */
  userPositions: UserLendingPosition[];
  /** Aggregate lending stats */
  stats: LendingStats;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Selected market for operations */
  selectedMarket: LendingMarket | null;
  /** Set selected market */
  setSelectedMarket: (market: LendingMarket | null) => void;
  /** Supply assets to a market */
  supply: (marketId: string, amount: bigint) => Promise<void>;
  /** Withdraw supplied assets */
  withdrawSupply: (marketId: string, amount: bigint) => Promise<void>;
  /** Deposit collateral */
  depositCollateral: (marketId: string, amount: bigint) => Promise<void>;
  /** Withdraw collateral */
  withdrawCollateral: (marketId: string, amount: bigint) => Promise<void>;
  /** Borrow from a market */
  borrow: (marketId: string, amount: bigint) => Promise<void>;
  /** Repay borrowed amount */
  repay: (marketId: string, amount: bigint) => Promise<void>;
  /** Transaction pending */
  isPending: boolean;
  /** Transaction hash */
  txHash: `0x${string}` | undefined;
  /** Refetch data */
  refetch: () => void;
}

/**
 * Hook for interacting with Lux Liquid lending markets
 *
 * Provides:
 * - Market data (TVL, APY, utilization)
 * - User positions (collateral, borrowed, health factor)
 * - Supply/borrow/repay operations
 *
 * Based on Dolomite/Frax lending patterns
 */
export function useLendingMarkets(): UseLendingMarketsResult {
  const { address, isConnected } = useAccount();
  const [selectedMarket, setSelectedMarket] = useState<LendingMarket | null>(null);

  // Write contract hook
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // For now, use mock data until contracts are deployed
  // TODO: Replace with actual contract reads when deployed
  const markets = useMemo(() => MOCK_LENDING_MARKETS, []);

  // Calculate aggregate stats
  const stats = useMemo<LendingStats>(() => {
    const totalTVL = markets.reduce((sum, m) => sum + m.tvlUSD, 0);
    const totalBorrowed = markets.reduce((sum, m) => {
      const borrowDecimals = m.borrowAsset.decimals;
      const borrowedUSD =
        Number(m.totalBorrowed) / 10 ** borrowDecimals * (m.tvlUSD / (Number(m.totalSupplied) / 10 ** 18));
      return sum + borrowedUSD;
    }, 0);

    return {
      totalTVL,
      totalBorrowed,
      totalSupplyInterest: totalTVL * 0.04 * 0.5, // Rough estimate
      activeMarkets: markets.filter(m => m.isActive).length,
      uniqueSuppliers: 1250, // Mock
      uniqueBorrowers: 380, // Mock
    };
  }, [markets]);

  // Mock user positions
  const userPositions = useMemo<UserLendingPosition[]>(() => {
    if (!isConnected) return [];

    // Return empty positions for now - will be populated from contract reads
    return [];
  }, [isConnected]);

  // Supply function
  const supply = useCallback(
    async (marketId: string, amount: bigint) => {
      const market = markets.find(m => m.id === marketId);
      if (!market || !address) {
        throw new Error('Market not found or wallet not connected');
      }

      writeContract({
        address: market.marketAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'deposit',
        args: [amount, address],
      });
    },
    [markets, address, writeContract],
  );

  // Withdraw supply function
  const withdrawSupply = useCallback(
    async (marketId: string, amount: bigint) => {
      const market = markets.find(m => m.id === marketId);
      if (!market || !address) {
        throw new Error('Market not found or wallet not connected');
      }

      writeContract({
        address: market.marketAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'withdraw',
        args: [amount, address, address],
      });
    },
    [markets, address, writeContract],
  );

  // Deposit collateral function
  const depositCollateral = useCallback(
    async (marketId: string, amount: bigint) => {
      const market = markets.find(m => m.id === marketId);
      if (!market || !address) {
        throw new Error('Market not found or wallet not connected');
      }

      writeContract({
        address: market.marketAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'depositCollateral',
        args: [amount, address],
      });
    },
    [markets, address, writeContract],
  );

  // Withdraw collateral function
  const withdrawCollateral = useCallback(
    async (marketId: string, amount: bigint) => {
      const market = markets.find(m => m.id === marketId);
      if (!market || !address) {
        throw new Error('Market not found or wallet not connected');
      }

      writeContract({
        address: market.marketAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'withdrawCollateral',
        args: [amount, address],
      });
    },
    [markets, address, writeContract],
  );

  // Borrow function
  const borrow = useCallback(
    async (marketId: string, amount: bigint) => {
      const market = markets.find(m => m.id === marketId);
      if (!market || !address) {
        throw new Error('Market not found or wallet not connected');
      }

      writeContract({
        address: market.marketAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'borrow',
        args: [amount, address],
      });
    },
    [markets, address, writeContract],
  );

  // Repay function
  const repay = useCallback(
    async (marketId: string, amount: bigint) => {
      const market = markets.find(m => m.id === marketId);
      if (!market || !address) {
        throw new Error('Market not found or wallet not connected');
      }

      writeContract({
        address: market.marketAddress,
        abi: LENDING_POOL_ABI,
        functionName: 'repay',
        args: [amount, address],
      });
    },
    [markets, address, writeContract],
  );

  // Refetch function (placeholder for now)
  const refetch = useCallback(() => {
    // Will trigger refetch of contract data when implemented
  }, []);

  return {
    markets,
    userPositions,
    stats,
    isLoading: false,
    error: writeError as Error | null,
    selectedMarket,
    setSelectedMarket,
    supply,
    withdrawSupply,
    depositCollateral,
    withdrawCollateral,
    borrow,
    repay,
    isPending: isWritePending || isConfirming,
    txHash,
    refetch,
  };
}

/**
 * Hook to get a specific lending market by ID
 */
export function useLendingMarket(marketId: string) {
  const { markets, ...rest } = useLendingMarkets();

  const market = useMemo(() => {
    return markets.find(m => m.id === marketId) ?? null;
  }, [markets, marketId]);

  return { market, markets, ...rest };
}

/**
 * Hook to calculate maximum borrowable amount based on collateral
 */
export function useMaxBorrowable(
  collateralValue: number,
  ltv: number,
  currentBorrowed: number = 0,
): number {
  return useMemo(() => {
    const maxBorrow = collateralValue * ltv;
    return Math.max(0, maxBorrow - currentBorrowed);
  }, [collateralValue, ltv, currentBorrowed]);
}

/**
 * Hook to simulate health factor changes
 */
export function useHealthFactorSimulation(
  collateralValue: number,
  borrowedValue: number,
  liquidationThreshold: number,
) {
  return useMemo(() => {
    if (borrowedValue === 0) {
      return { healthFactor: Infinity, isHealthy: true, isAtRisk: false };
    }

    const healthFactor = (collateralValue * liquidationThreshold) / borrowedValue;

    return {
      healthFactor,
      isHealthy: healthFactor >= 1.5,
      isAtRisk: healthFactor < 1.2,
    };
  }, [collateralValue, borrowedValue, liquidationThreshold]);
}
