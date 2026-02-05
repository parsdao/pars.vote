import { useCallback, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseEther, formatEther } from 'viem';
import {
  LiquidityPool,
  UserPosition,
  PoolStats,
  AMM_CONTRACTS,
  MOCK_POOLS,
  MOCK_USER_POSITIONS,
  PoolFee,
  calculateAPYFromVolume,
  isPositionInRange,
} from '../types/liquidityPools';

// ============================================================================
// ABIs (Subset for Lux AMM - Uniswap V3 style)
// ============================================================================

const POOL_ABI = [
  {
    name: 'slot0',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    name: 'liquidity',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    name: 'token0',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'token1',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'fee',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint24' }],
    stateMutability: 'view',
  },
] as const;

const POSITION_MANAGER_ABI = [
  {
    name: 'positions',
    type: 'function',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'mint',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'token0', type: 'address' },
          { name: 'token1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickLower', type: 'int24' },
          { name: 'tickUpper', type: 'int24' },
          { name: 'amount0Desired', type: 'uint256' },
          { name: 'amount1Desired', type: 'uint256' },
          { name: 'amount0Min', type: 'uint256' },
          { name: 'amount1Min', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
    ],
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    name: 'increaseLiquidity',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'amount0Desired', type: 'uint256' },
          { name: 'amount1Desired', type: 'uint256' },
          { name: 'amount0Min', type: 'uint256' },
          { name: 'amount1Min', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
    ],
    outputs: [
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    name: 'decreaseLiquidity',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'liquidity', type: 'uint128' },
          { name: 'amount0Min', type: 'uint256' },
          { name: 'amount1Min', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
    ],
    outputs: [
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    name: 'collect',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'amount0Max', type: 'uint128' },
          { name: 'amount1Max', type: 'uint128' },
        ],
      },
    ],
    outputs: [
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
] as const;

// ============================================================================
// TYPES
// ============================================================================

export interface UseLiquidityPoolsResult {
  /** All available pools */
  pools: LiquidityPool[];
  /** User's LP positions */
  positions: UserPosition[];
  /** Selected pool details */
  selectedPool: LiquidityPool | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Select a pool */
  selectPool: (address: Address) => void;
  /** Refresh pool data */
  refetch: () => void;
  /** Total TVL across all pools */
  totalTVL: number;
  /** Total 24h volume across all pools */
  totalVolume24h: number;
  /** User's total LP value */
  userTotalValue: number;
  /** User's total uncollected fees */
  userTotalFees: number;
}

export interface UseAddLiquidityResult {
  /** Add liquidity to a pool */
  addLiquidity: (params: AddLiquidityParams) => Promise<void>;
  /** Transaction pending */
  isPending: boolean;
  /** Transaction hash */
  txHash: `0x${string}` | undefined;
  /** Error */
  error: Error | null;
}

export interface AddLiquidityParams {
  poolAddress: Address;
  token0: Address;
  token1: Address;
  fee: PoolFee;
  tickLower: number;
  tickUpper: number;
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: bigint;
}

export interface UseRemoveLiquidityResult {
  /** Remove liquidity from position */
  removeLiquidity: (tokenId: bigint, liquidity: bigint, slippage: number) => Promise<void>;
  /** Collect fees */
  collectFees: (tokenId: bigint) => Promise<void>;
  /** Transaction pending */
  isPending: boolean;
  /** Transaction hash */
  txHash: `0x${string}` | undefined;
  /** Error */
  error: Error | null;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for fetching and managing liquidity pools
 */
export function useLiquidityPools(): UseLiquidityPoolsResult {
  const { address, isConnected } = useAccount();
  const [selectedPoolAddress, setSelectedPoolAddress] = useState<Address | null>(null);

  // Check if contracts are deployed
  const isContractDeployed = !!AMM_CONTRACTS.factory;

  // For now, use mock data since contracts aren't deployed
  // In production, this would query on-chain data
  const pools = useMemo(() => {
    if (!isContractDeployed) {
      return MOCK_POOLS;
    }
    // TODO: Fetch from subgraph or on-chain
    return MOCK_POOLS;
  }, [isContractDeployed]);

  // Get user positions
  const positions = useMemo(() => {
    if (!isConnected || !address) {
      return [];
    }
    if (!isContractDeployed) {
      // Return mock positions with user address
      return MOCK_USER_POSITIONS.map(pos => ({
        ...pos,
        owner: address,
      }));
    }
    // TODO: Fetch from position manager
    return [];
  }, [isConnected, address, isContractDeployed]);

  // Calculate totals
  const totalTVL = useMemo(() => {
    return pools.reduce((sum, pool) => sum + pool.tvlUSD, 0);
  }, [pools]);

  const totalVolume24h = useMemo(() => {
    return pools.reduce((sum, pool) => sum + pool.volume24h, 0);
  }, [pools]);

  const userTotalValue = useMemo(() => {
    return positions.reduce((sum, pos) => sum + pos.valueUSD, 0);
  }, [positions]);

  const userTotalFees = useMemo(() => {
    // Simplified: assume 1:1 USD value for fees
    return positions.reduce((sum, pos) => {
      const fees0USD = Number(formatEther(pos.fees0));
      const fees1USD = Number(formatEther(pos.fees1));
      return sum + fees0USD + fees1USD;
    }, 0);
  }, [positions]);

  // Selected pool
  const selectedPool = useMemo(() => {
    if (!selectedPoolAddress) return null;
    return pools.find(p => p.address === selectedPoolAddress) ?? null;
  }, [pools, selectedPoolAddress]);

  const selectPool = useCallback((poolAddress: Address) => {
    setSelectedPoolAddress(poolAddress);
  }, []);

  const refetch = useCallback(() => {
    // TODO: Implement refetch logic
  }, []);

  return {
    pools,
    positions,
    selectedPool,
    isLoading: false,
    error: null,
    selectPool,
    refetch,
    totalTVL,
    totalVolume24h,
    userTotalValue,
    userTotalFees,
  };
}

/**
 * Hook for adding liquidity to a pool
 */
export function useAddLiquidity(): UseAddLiquidityResult {
  const { address } = useAccount();
  const positionManagerAddress = AMM_CONTRACTS.positionManager as Address | undefined;

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const addLiquidity = useCallback(
    async (params: AddLiquidityParams) => {
      if (!positionManagerAddress || !address) {
        throw new Error('Position manager not deployed or wallet not connected');
      }

      writeContract({
        address: positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'mint',
        args: [
          {
            token0: params.token0,
            token1: params.token1,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            amount0Desired: params.amount0Desired,
            amount1Desired: params.amount1Desired,
            amount0Min: params.amount0Min,
            amount1Min: params.amount1Min,
            recipient: address,
            deadline: params.deadline,
          },
        ],
      });
    },
    [positionManagerAddress, address, writeContract],
  );

  return {
    addLiquidity,
    isPending: isWritePending || isConfirming,
    txHash,
    error: writeError as Error | null,
  };
}

/**
 * Hook for removing liquidity and collecting fees
 */
export function useRemoveLiquidity(): UseRemoveLiquidityResult {
  const { address } = useAccount();
  const positionManagerAddress = AMM_CONTRACTS.positionManager as Address | undefined;

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const removeLiquidity = useCallback(
    async (tokenId: bigint, liquidity: bigint, slippage: number) => {
      if (!positionManagerAddress || !address) {
        throw new Error('Position manager not deployed or wallet not connected');
      }

      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 minutes

      writeContract({
        address: positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'decreaseLiquidity',
        args: [
          {
            tokenId,
            liquidity: BigInt(liquidity.toString()),
            amount0Min: 0n, // Should calculate based on slippage
            amount1Min: 0n, // Should calculate based on slippage
            deadline,
          },
        ],
      });
    },
    [positionManagerAddress, address, writeContract],
  );

  const collectFees = useCallback(
    async (tokenId: bigint) => {
      if (!positionManagerAddress || !address) {
        throw new Error('Position manager not deployed or wallet not connected');
      }

      const MAX_UINT128 = BigInt('340282366920938463463374607431768211455');

      writeContract({
        address: positionManagerAddress,
        abi: POSITION_MANAGER_ABI,
        functionName: 'collect',
        args: [
          {
            tokenId,
            recipient: address,
            amount0Max: MAX_UINT128,
            amount1Max: MAX_UINT128,
          },
        ],
      });
    },
    [positionManagerAddress, address, writeContract],
  );

  return {
    removeLiquidity,
    collectFees,
    isPending: isWritePending || isConfirming,
    txHash,
    error: writeError as Error | null,
  };
}

/**
 * Hook to get pool statistics
 */
export function usePoolStats(poolAddress: Address | undefined): PoolStats | null {
  const { pools } = useLiquidityPools();

  return useMemo(() => {
    if (!poolAddress) return null;

    const pool = pools.find(p => p.address === poolAddress);
    if (!pool) return null;

    return {
      poolAddress,
      volume24h: pool.volume24h,
      volume7d: pool.volume24h * 7, // Simplified
      fees24h: (pool.volume24h * pool.fee) / 1_000_000,
      tvl: pool.tvlUSD,
      price: 1.0, // Simplified: calculate from sqrtPriceX96
      priceChange24h: 0.023, // Mock: 2.3%
      positionCount: 150, // Mock
    };
  }, [poolAddress, pools]);
}
