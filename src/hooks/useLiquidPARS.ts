import { useCallback, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseEther, formatEther } from 'viem';
import {
  LIQUID_PARS_VAULT,
  SELF_REPAYING_PARAMS,
  getExpectedBlendedAPY,
  CONTRACT_ADDRESSES,
} from '../types/liquidProtocol';

// ERC4626 Vault ABI (subset for LiquidPARS)
const LIQUID_PARS_ABI = [
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
  {
    name: 'redeem',
    type: 'function',
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'receiver', type: 'address' },
      { name: 'owner', type: 'address' },
    ],
    outputs: [{ name: 'assets', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'totalAssets',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'totalSupply',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'convertToAssets',
    type: 'function',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'convertToShares',
    type: 'function',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'previewDeposit',
    type: 'function',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'previewWithdraw',
    type: 'function',
    inputs: [{ name: 'assets', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'maxDeposit',
    type: 'function',
    inputs: [{ name: 'receiver', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'maxWithdraw',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

export interface LiquidPARSPosition {
  /** xPARS shares balance */
  shares: bigint;
  /** Underlying PARS value of shares */
  assetsValue: bigint;
  /** Unrealized yield (assetsValue - deposited) */
  unrealizedYield: bigint;
  /** Share price ratio */
  sharePrice: number;
}

export interface LiquidPARSVaultStats {
  /** Total PARS in vault */
  totalAssets: bigint;
  /** Total xPARS shares */
  totalShares: bigint;
  /** Current share price */
  sharePrice: number;
  /** Expected APY range */
  expectedAPY: { min: number; max: number };
  /** Fee split configuration */
  feeSplit: typeof LIQUID_PARS_VAULT.feeSplit;
}

export interface UseLiquidPARSResult {
  /** User's position in the vault */
  position: LiquidPARSPosition | null;
  /** Vault statistics */
  vaultStats: LiquidPARSVaultStats | null;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Deposit PARS into vault */
  deposit: (amount: bigint) => Promise<void>;
  /** Withdraw PARS from vault */
  withdraw: (amount: bigint) => Promise<void>;
  /** Redeem xPARS shares for PARS */
  redeem: (shares: bigint) => Promise<void>;
  /** Transaction pending state */
  isPending: boolean;
  /** Transaction hash if pending */
  txHash: `0x${string}` | undefined;
}

/**
 * Hook for interacting with the LiquidPARS vault (ERC4626)
 *
 * Provides:
 * - User position tracking (shares, value, unrealized yield)
 * - Vault statistics (TVL, share price, APY)
 * - Deposit/withdraw/redeem operations
 *
 * Based on luxfi/standard LiquidLUX implementation
 */
export function useLiquidPARS(): UseLiquidPARSResult {
  const { address, isConnected } = useAccount();

  // Contract address (will be populated after deployment)
  const vaultAddress = CONTRACT_ADDRESSES.liquidPARS as Address | undefined;
  const isContractDeployed = !!vaultAddress;

  // Read vault total assets
  const {
    data: totalAssets,
    isLoading: isLoadingAssets,
    error: assetsError,
  } = useReadContract({
    address: vaultAddress,
    abi: LIQUID_PARS_ABI,
    functionName: 'totalAssets',
    query: {
      enabled: isContractDeployed,
    },
  });

  // Read vault total supply
  const {
    data: totalShares,
    isLoading: isLoadingShares,
    error: sharesError,
  } = useReadContract({
    address: vaultAddress,
    abi: LIQUID_PARS_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: isContractDeployed,
    },
  });

  // Read user's xPARS balance
  const {
    data: userShares,
    isLoading: isLoadingUserShares,
    error: userSharesError,
  } = useReadContract({
    address: vaultAddress,
    abi: LIQUID_PARS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isContractDeployed && isConnected && !!address,
    },
  });

  // Convert user shares to assets
  const {
    data: userAssetsValue,
    isLoading: isLoadingUserAssets,
  } = useReadContract({
    address: vaultAddress,
    abi: LIQUID_PARS_ABI,
    functionName: 'convertToAssets',
    args: userShares ? [userShares] : undefined,
    query: {
      enabled: isContractDeployed && !!userShares && userShares > 0n,
    },
  });

  // Write contract functions
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Calculate share price
  const sharePrice = useMemo(() => {
    if (!totalAssets || !totalShares || totalShares === 0n) return 1;
    return Number(totalAssets) / Number(totalShares);
  }, [totalAssets, totalShares]);

  // Calculate expected APY
  const expectedAPY = useMemo(() => getExpectedBlendedAPY(), []);

  // Build vault stats
  const vaultStats: LiquidPARSVaultStats | null = useMemo(() => {
    if (!isContractDeployed) {
      // Return mock data for UI development
      return {
        totalAssets: 0n,
        totalShares: 0n,
        sharePrice: 1,
        expectedAPY,
        feeSplit: LIQUID_PARS_VAULT.feeSplit,
      };
    }

    if (!totalAssets || !totalShares) return null;

    return {
      totalAssets,
      totalShares,
      sharePrice,
      expectedAPY,
      feeSplit: LIQUID_PARS_VAULT.feeSplit,
    };
  }, [isContractDeployed, totalAssets, totalShares, sharePrice, expectedAPY]);

  // Build user position
  const position: LiquidPARSPosition | null = useMemo(() => {
    if (!isConnected) return null;
    if (!isContractDeployed) {
      // Return empty position for UI development
      return {
        shares: 0n,
        assetsValue: 0n,
        unrealizedYield: 0n,
        sharePrice: 1,
      };
    }

    if (!userShares) return null;

    const assetsValue = userAssetsValue ?? 0n;
    // Note: To properly track unrealized yield, we'd need to store original deposit amount
    // For now, assume any value above shares is yield (simplified)
    const unrealizedYield = assetsValue > userShares ? assetsValue - userShares : 0n;

    return {
      shares: userShares,
      assetsValue,
      unrealizedYield,
      sharePrice,
    };
  }, [isConnected, isContractDeployed, userShares, userAssetsValue, sharePrice]);

  // Deposit function
  const deposit = useCallback(
    async (amount: bigint) => {
      if (!vaultAddress || !address) {
        throw new Error('Vault not deployed or wallet not connected');
      }

      writeContract({
        address: vaultAddress,
        abi: LIQUID_PARS_ABI,
        functionName: 'deposit',
        args: [amount, address],
      });
    },
    [vaultAddress, address, writeContract],
  );

  // Withdraw function
  const withdraw = useCallback(
    async (amount: bigint) => {
      if (!vaultAddress || !address) {
        throw new Error('Vault not deployed or wallet not connected');
      }

      writeContract({
        address: vaultAddress,
        abi: LIQUID_PARS_ABI,
        functionName: 'withdraw',
        args: [amount, address, address],
      });
    },
    [vaultAddress, address, writeContract],
  );

  // Redeem function
  const redeem = useCallback(
    async (shares: bigint) => {
      if (!vaultAddress || !address) {
        throw new Error('Vault not deployed or wallet not connected');
      }

      writeContract({
        address: vaultAddress,
        abi: LIQUID_PARS_ABI,
        functionName: 'redeem',
        args: [shares, address, address],
      });
    },
    [vaultAddress, address, writeContract],
  );

  const isLoading =
    isLoadingAssets || isLoadingShares || isLoadingUserShares || isLoadingUserAssets;
  const error = assetsError || sharesError || userSharesError || writeError;

  return {
    position,
    vaultStats,
    isLoading,
    error: error as Error | null,
    deposit,
    withdraw,
    redeem,
    isPending: isWritePending || isConfirming,
    txHash,
  };
}

/**
 * Hook to get self-repaying loan parameters
 */
export function useSelfRepayingParams() {
  return useMemo(() => SELF_REPAYING_PARAMS, []);
}

/**
 * Hook to calculate maximum borrowable amount based on collateral
 */
export function useMaxBorrow(collateralValue: bigint): bigint {
  const params = useSelfRepayingParams();
  return useMemo(() => {
    const maxBorrow = (collateralValue * BigInt(Math.floor(params.maxLTV * 10000))) / 10000n;
    return maxBorrow;
  }, [collateralValue, params.maxLTV]);
}

/**
 * Hook to check if position is healthy (not at risk of liquidation)
 */
export function usePositionHealth(
  collateralValue: bigint,
  debtValue: bigint,
): { healthFactor: number; isHealthy: boolean; isAtRisk: boolean } {
  const params = useSelfRepayingParams();

  return useMemo(() => {
    if (debtValue === 0n) {
      return { healthFactor: Infinity, isHealthy: true, isAtRisk: false };
    }

    const healthFactor = Number(collateralValue) / Number(debtValue);
    const liquidationThreshold = 1 / params.liquidationThreshold;

    return {
      healthFactor,
      isHealthy: healthFactor >= liquidationThreshold,
      isAtRisk: healthFactor < liquidationThreshold * 1.1, // Within 10% of liquidation
    };
  }, [collateralValue, debtValue, params.liquidationThreshold]);
}
