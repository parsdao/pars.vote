import { useCallback, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Address } from 'viem';
import {
  GOVERNANCE_PARAMS,
  KARMA_DECAY,
  calculateVotingPower,
  CONTRACT_ADDRESSES,
} from '../types/liquidProtocol';

// vPARS Token ABI (subset for voting power)
const VPARS_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getVotingPower',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getKarma',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getLockInfo',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'lockEnd', type: 'uint256' },
      { name: 'lockMonths', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    name: 'totalVotingPower',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

// PARS Token ABI (basic ERC20)
const PARS_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
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
] as const;

export interface VotingPowerBreakdown {
  /** Raw PARS balance */
  parsBalance: bigint;
  /** Karma score (0-1000) */
  karma: number;
  /** Lock duration in months (0-40) */
  lockMonths: number;
  /** Lock end timestamp */
  lockEnd: number;
  /** Karma multiplier (sqrt(K/100)) */
  karmaMultiplier: number;
  /** Lock multiplier (1 + months * 0.1) */
  lockMultiplier: number;
  /** Total multiplier (capped at maxBoost) */
  totalMultiplier: number;
  /** Final vPARS voting power */
  votingPower: bigint;
  /** Percentage of total voting power */
  votingShare: number;
}

export interface KarmaInfo {
  /** Current karma score */
  current: number;
  /** Is user considered active (>=1 tx/month) */
  isActive: boolean;
  /** Projected karma after 1 year */
  projectedOneYear: number;
  /** Minimum karma (for verified DIDs) */
  minimum: number;
  /** Days until karma drops below threshold */
  daysUntilDecay: number | null;
}

export interface UseVotingPowerResult {
  /** User's voting power breakdown */
  breakdown: VotingPowerBreakdown | null;
  /** User's karma information */
  karmaInfo: KarmaInfo | null;
  /** Total voting power in the system */
  totalVotingPower: bigint;
  /** Whether data is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Governance parameters */
  params: typeof GOVERNANCE_PARAMS;
  /** Calculate voting power for a hypothetical position */
  calculatePower: (pars: bigint, karma: number, lockMonths: number) => bigint;
  /** Get optimal lock duration for target voting power */
  getOptimalLock: (targetMultiplier: number, currentKarma: number) => number;
}

/**
 * Hook for calculating and displaying vPARS voting power
 *
 * Implements the voting power formula from luxfi/standard:
 * vPARS = PARS × sqrt(K/100) × (1 + lock_months × 0.1)
 *
 * Maximum boost: 3.16x (Karma 1000) × 4.0x (40 months) = 12.64x
 */
export function useVotingPower(): UseVotingPowerResult {
  const { address, isConnected } = useAccount();

  // Contract addresses (will be populated after deployment)
  const parsAddress = CONTRACT_ADDRESSES.pars as Address | undefined;
  const isContractDeployed = !!parsAddress;

  // Read user's PARS balance
  const {
    data: parsBalance,
    isLoading: isLoadingPars,
    error: parsError,
  } = useReadContract({
    address: parsAddress,
    abi: PARS_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: isContractDeployed && isConnected && !!address,
    },
  });

  // For now, use mock karma and lock data since contracts aren't deployed
  // In production, these would come from on-chain governance contracts
  const mockKarma = 100; // Default karma score
  const mockLockMonths = 0; // No lock by default
  const mockLockEnd = 0;

  // Calculate multipliers
  const karmaMultiplier = useMemo(() => Math.sqrt(mockKarma / 100), [mockKarma]);
  const lockMultiplier = useMemo(() => 1 + mockLockMonths * 0.1, [mockLockMonths]);
  const totalMultiplier = useMemo(
    () => Math.min(karmaMultiplier * lockMultiplier, GOVERNANCE_PARAMS.maxBoost),
    [karmaMultiplier, lockMultiplier],
  );

  // Calculate voting power
  const votingPower = useMemo(() => {
    if (!parsBalance) return 0n;
    return calculateVotingPower(parsBalance, mockKarma, mockLockMonths);
  }, [parsBalance, mockKarma, mockLockMonths]);

  // Build voting power breakdown
  const breakdown: VotingPowerBreakdown | null = useMemo(() => {
    if (!isConnected) return null;

    const balance = parsBalance ?? 0n;

    return {
      parsBalance: balance,
      karma: mockKarma,
      lockMonths: mockLockMonths,
      lockEnd: mockLockEnd,
      karmaMultiplier,
      lockMultiplier,
      totalMultiplier,
      votingPower,
      votingShare: 0, // Would need total voting power to calculate
    };
  }, [
    isConnected,
    parsBalance,
    mockKarma,
    mockLockMonths,
    mockLockEnd,
    karmaMultiplier,
    lockMultiplier,
    totalMultiplier,
    votingPower,
  ]);

  // Build karma info
  const karmaInfo: KarmaInfo | null = useMemo(() => {
    if (!isConnected) return null;

    const isActive = true; // Would check on-chain activity
    const decayRate = isActive
      ? KARMA_DECAY.activeDecayPerYear
      : KARMA_DECAY.inactiveDecayPerYear;
    const projectedOneYear = mockKarma * (1 - decayRate);

    return {
      current: mockKarma,
      isActive,
      projectedOneYear,
      minimum: KARMA_DECAY.minVerifiedKarma,
      daysUntilDecay: isActive ? null : Math.floor((mockKarma - KARMA_DECAY.minVerifiedKarma) / (decayRate / 365)),
    };
  }, [isConnected, mockKarma]);

  // Calculate power helper function
  const calculatePower = useCallback(
    (pars: bigint, karma: number, lockMonths: number): bigint => {
      return calculateVotingPower(pars, karma, lockMonths);
    },
    [],
  );

  // Get optimal lock duration for target multiplier
  const getOptimalLock = useCallback(
    (targetMultiplier: number, currentKarma: number): number => {
      const karmaBoost = Math.sqrt(currentKarma / 100);
      const neededLockBoost = targetMultiplier / karmaBoost;
      // lockMultiplier = 1 + months * 0.1
      // months = (lockMultiplier - 1) / 0.1
      const months = Math.ceil((neededLockBoost - 1) / 0.1);
      return Math.min(Math.max(0, months), 40); // Cap at 40 months
    },
    [],
  );

  return {
    breakdown,
    karmaInfo,
    totalVotingPower: 0n, // Would come from on-chain
    isLoading: isLoadingPars,
    error: parsError as Error | null,
    params: GOVERNANCE_PARAMS,
    calculatePower,
    getOptimalLock,
  };
}

/**
 * Hook to calculate voting power boost scenarios
 */
export function useVotingPowerSimulator() {
  const { breakdown } = useVotingPower();

  const simulateBoost = useCallback(
    (
      additionalPars: bigint,
      newKarma: number,
      newLockMonths: number,
    ): {
      currentPower: bigint;
      newPower: bigint;
      increase: bigint;
      percentIncrease: number;
    } => {
      const currentPars = breakdown?.parsBalance ?? 0n;
      const currentKarma = breakdown?.karma ?? 100;
      const currentLock = breakdown?.lockMonths ?? 0;

      const currentPower = calculateVotingPower(currentPars, currentKarma, currentLock);
      const newPower = calculateVotingPower(
        currentPars + additionalPars,
        newKarma,
        newLockMonths,
      );

      const increase = newPower - currentPower;
      const percentIncrease =
        currentPower > 0n ? (Number(increase) / Number(currentPower)) * 100 : 0;

      return {
        currentPower,
        newPower,
        increase,
        percentIncrease,
      };
    },
    [breakdown],
  );

  return {
    currentBreakdown: breakdown,
    simulateBoost,
    maxBoost: GOVERNANCE_PARAMS.maxBoost,
    karmaFormula: GOVERNANCE_PARAMS.karmaFormula,
    lockFormula: GOVERNANCE_PARAMS.timeLockFormula,
  };
}

/**
 * Hook to check if user meets quorum requirements
 */
export function useQuorumCheck(proposalVotes: bigint): {
  meetsQuorum: boolean;
  currentVotes: bigint;
  quorumRequired: bigint;
  percentOfQuorum: number;
} {
  const quorumRequired = BigInt(GOVERNANCE_PARAMS.quorumThreshold);

  return useMemo(
    () => ({
      meetsQuorum: proposalVotes >= quorumRequired,
      currentVotes: proposalVotes,
      quorumRequired,
      percentOfQuorum: Number((proposalVotes * 100n) / quorumRequired),
    }),
    [proposalVotes, quorumRequired],
  );
}
