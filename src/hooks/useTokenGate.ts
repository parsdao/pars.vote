import { useEffect, useState } from 'react';
import { Address, erc20Abi } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { VENTURE_ACCESS_THRESHOLD, CYRUS_TOKEN_ADDRESS } from '../types/ventures';

interface TokenGateResult {
  isLoading: boolean;
  hasAccess: boolean;
  balance: bigint;
  requiredBalance: bigint;
  shortfall: bigint;
}

export function useTokenGate(
  tokenAddress: Address = CYRUS_TOKEN_ADDRESS,
  requiredBalance: bigint = VENTURE_ACCESS_THRESHOLD,
): TokenGateResult {
  const { address: userAddress, isConnected } = useAccount();
  const [hasAccess, setHasAccess] = useState(false);

  const { data: balance, isLoading } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: isConnected && !!userAddress,
    },
  });

  useEffect(() => {
    if (balance !== undefined) {
      setHasAccess(balance >= requiredBalance);
    }
  }, [balance, requiredBalance]);

  const currentBalance = balance ?? BigInt(0);
  const shortfall = currentBalance >= requiredBalance ? BigInt(0) : requiredBalance - currentBalance;

  return {
    isLoading,
    hasAccess: isConnected && hasAccess,
    balance: currentBalance,
    requiredBalance,
    shortfall,
  };
}

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === BigInt(0)) {
    return whole.toLocaleString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2);
  return `${whole.toLocaleString()}.${fractionStr}`;
}
