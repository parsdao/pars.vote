import { Address } from 'viem';

/**
 * PARS-10 Cashflow System - v1 Spec
 *
 * This implements the whitepaper-grade v1 cashflow routing:
 * - Hard base split: 1% to each DAO (10% total) - non-discretionary
 * - Remaining 90% → Treasury Fee Vault → distributed via gauge weights
 * - Mint proceeds: 100% → Treasury DAO
 * - POL Vault for protocol-owned liquidity
 * - GaugeController for governance-controlled allocations
 */

// ============================================================================
// FEE ROUTER CONFIGURATION
// ============================================================================

/**
 * FeeRouter: The rule engine for fee distribution
 *
 * - Receives all protocol fees from FeeCollectors
 * - Implements base split: 10 × 1% → DAO vaults
 * - Routes remainder: 90% → TreasuryFeeVault
 */

export interface FeeRouterConfig {
  /** Base split per DAO (1% each, hardcoded) */
  baseSplitPerDAO: number;
  /** Number of DAOs (10 for PARS-10) */
  daoCount: number;
  /** Total base allocation (10%) */
  totalBaseAllocation: number;
  /** Remainder to Treasury Fee Vault (90%) */
  remainderToTreasury: number;
}

export const FEE_ROUTER_CONFIG: FeeRouterConfig = {
  baseSplitPerDAO: 1,
  daoCount: 10,
  totalBaseAllocation: 10,
  remainderToTreasury: 90,
};

// ============================================================================
// GAUGE CONTROLLER (Governance Weights)
// ============================================================================

/**
 * GaugeController: Stores weights for allocating the 90% remainder
 *
 * Categories:
 * - POL Growth: Building protocol-owned liquidity
 * - Holder Rewards: Fee claims / distributions
 * - Program Budgets: Operational spending
 * - Reserves: Insurance / emergency fund
 */

export type GaugeCategory = 'pol-growth' | 'holder-rewards' | 'program-budgets' | 'reserves';

export interface GaugeWeight {
  category: GaugeCategory;
  weight: number; // Percentage of remainder (sums to 100)
  label: string;
  description: string;
}

export interface GaugeControllerConfig {
  /** Current epoch number */
  currentEpoch: number;
  /** Epoch duration in weeks */
  epochDurationWeeks: number;
  /** Max weight change per epoch (±5%) */
  maxWeightChangePerEpoch: number;
  /** Weights (must sum to 100) */
  weights: GaugeWeight[];
  /** Next epoch timestamp */
  nextEpochTimestamp: number;
}

export const INITIAL_GAUGE_WEIGHTS: GaugeWeight[] = [
  {
    category: 'pol-growth',
    weight: 30,
    label: 'POL Growth',
    description: 'Build protocol-owned liquidity',
  },
  {
    category: 'holder-rewards',
    weight: 40,
    label: 'Holder Rewards',
    description: 'Fee claims for token holders',
  },
  {
    category: 'program-budgets',
    weight: 20,
    label: 'Program Budgets',
    description: 'Operational and development spending',
  },
  {
    category: 'reserves',
    weight: 10,
    label: 'Reserves',
    description: 'Insurance and emergency fund',
  },
];

export const GAUGE_CONTROLLER_CONFIG: GaugeControllerConfig = {
  currentEpoch: 0,
  epochDurationWeeks: 1, // Weekly epochs
  maxWeightChangePerEpoch: 5, // ±5% max change
  weights: INITIAL_GAUGE_WEIGHTS,
  nextEpochTimestamp: 0, // Set at deployment
};

// ============================================================================
// VAULT TYPES
// ============================================================================

export type VaultType = 'dao-vault' | 'treasury-vault' | 'treasury-fee-vault' | 'pol-vault';

export interface VaultConfig {
  id: string;
  type: VaultType;
  name: string;
  persianName?: string;
  /** Address of the vault contract */
  address?: Address;
  /** Spending requires timelock */
  timelockRequired: boolean;
  /** Timelock duration in hours */
  timelockHours: number;
  /** Allowlisted execution paths */
  allowlistedPaths: string[];
}

/** DAO Vaults (budget buckets) - one per PARS-10 DAO */
export const DAO_VAULT_CONFIGS: VaultConfig[] = [
  { id: 'security-vault', type: 'dao-vault', name: 'Security DAO Vault', persianName: 'صندوق امنیّت', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'treasury-vault-dao', type: 'dao-vault', name: 'Treasury DAO Vault', persianName: 'صندوق خزانه', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'governance-vault', type: 'dao-vault', name: 'Governance DAO Vault', persianName: 'صندوق داد', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'health-vault', type: 'dao-vault', name: 'Health DAO Vault', persianName: 'صندوق سلامت', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'culture-vault', type: 'dao-vault', name: 'Culture DAO Vault', persianName: 'صندوق فرهنگ', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'research-vault', type: 'dao-vault', name: 'Research DAO Vault', persianName: 'صندوق دانش', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'infrastructure-vault', type: 'dao-vault', name: 'Infrastructure DAO Vault', persianName: 'صندوق زیرساخت', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'consular-vault', type: 'dao-vault', name: 'Consular DAO Vault', persianName: 'صندوق کنسولی', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'venture-vault', type: 'dao-vault', name: 'Venture DAO Vault', persianName: 'صندوق سرمایه', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
  { id: 'impact-vault', type: 'dao-vault', name: 'Impact DAO Vault', persianName: 'صندوق اثر', timelockRequired: true, timelockHours: 24, allowlistedPaths: ['treasury-execution'] },
];

/** Main Treasury Vault (Initial Treasury T) */
export const TREASURY_VAULT_CONFIG: VaultConfig = {
  id: 'treasury-main',
  type: 'treasury-vault',
  name: 'Treasury (Initial T)',
  persianName: 'خزانه اصلی',
  timelockRequired: true,
  timelockHours: 72, // Longer timelock for main treasury
  allowlistedPaths: ['timelock', 'execution-router'],
};

/** Treasury Fee Vault (receives 90% of fees) */
export const TREASURY_FEE_VAULT_CONFIG: VaultConfig = {
  id: 'treasury-fees',
  type: 'treasury-fee-vault',
  name: 'Treasury Fee Vault',
  persianName: 'صندوق کارمزد',
  timelockRequired: true,
  timelockHours: 24,
  allowlistedPaths: ['gauge-distribution'],
};

/** POL Vault (protocol-owned liquidity) */
export const POL_VAULT_CONFIG: VaultConfig = {
  id: 'pol',
  type: 'pol-vault',
  name: 'POL Vault',
  persianName: 'صندوق نقدینگی پروتکل',
  timelockRequired: true,
  timelockHours: 168, // 7 days for POL changes
  allowlistedPaths: ['strategy-router'],
};

// ============================================================================
// TIMELOCK CONFIGURATION
// ============================================================================

export interface TimelockConfig {
  /** Standard spend timelock (hours) */
  standardSpend: { min: number; max: number };
  /** POL/strategy change timelock (hours) */
  polStrategy: { min: number; max: number };
  /** Emergency actions (auto-expire hours) */
  emergencyExpiry: number;
}

export const TIMELOCK_CONFIG: TimelockConfig = {
  standardSpend: { min: 24, max: 72 },
  polStrategy: { min: 72, max: 168 }, // 72h to 7 days
  emergencyExpiry: 168, // 7 days auto-expire
};

// ============================================================================
// EMERGENCY CONTROLS
// ============================================================================

export interface EmergencyConfig {
  /** Security DAO can trigger these actions */
  triggerableBy: string;
  /** Actions available */
  actions: EmergencyAction[];
  /** Auto-expiry unless reauthorized */
  autoExpiryHours: number;
}

export interface EmergencyAction {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export const EMERGENCY_CONFIG: EmergencyConfig = {
  triggerableBy: 'security',
  actions: [
    {
      id: 'freeze-strategy',
      name: 'Freeze Strategy Router',
      description: 'Temporarily pause all strategy operations',
      severity: 'high',
    },
    {
      id: 'pause-external',
      name: 'Pause External Spend',
      description: 'Halt transfers to external addresses',
      severity: 'medium',
    },
    {
      id: 'pause-fee-router',
      name: 'Pause Fee Router',
      description: 'Temporarily halt fee distribution',
      severity: 'low',
    },
  ],
  autoExpiryHours: 168, // 7 days
};

// ============================================================================
// MINT REVENUE ROUTING
// ============================================================================

export interface MintRevenuePolicy {
  /** 100% of mint proceeds to Treasury */
  treasuryAllocation: number;
  /** Guardrails */
  guardrails: {
    /** Timelock on mint proceeds to external address */
    externalTransferTimelockHours: number;
    /** Minimum proposal threshold for spending */
    minProposalThresholdPercent: number;
    /** Emergency reserve (always liquid) */
    emergencyReservePercent: number;
  };
  /** Governance decides allocation for */
  governanceAllocates: string[];
}

export const MINT_REVENUE_POLICY: MintRevenuePolicy = {
  treasuryAllocation: 100,
  guardrails: {
    externalTransferTimelockHours: 72,
    minProposalThresholdPercent: 0.5,
    emergencyReservePercent: 10,
  },
  governanceAllocates: [
    'POL formation',
    'DAO T budgets',
    'Stable reserve',
    'Grants/partners',
  ],
};

// ============================================================================
// POL FORMATION POLICY
// ============================================================================

export interface POLPolicy {
  /** From mint proceeds: X% immediately seeded */
  mintSeedPercent: { min: number; max: number };
  /** Strategy Router capabilities */
  strategyCapabilities: string[];
  /** Governance can route fees to POL */
  feeRoutingEnabled: boolean;
}

export const POL_POLICY: POLPolicy = {
  mintSeedPercent: { min: 10, max: 30 },
  strategyCapabilities: [
    'add-liquidity',
    'rebalance-within-constraints',
    'harvest-fees',
    'route-fees-per-split',
  ],
  feeRoutingEnabled: true,
};

// ============================================================================
// DASHBOARD DATA TYPES
// ============================================================================

export interface VaultBalance {
  vaultId: string;
  asset: string;
  balance: bigint;
  usdValue: number;
  lastUpdated: number;
}

export interface FeeFlowStats {
  period: '24h' | '7d' | '30d';
  totalCollected: bigint;
  baseSplitDistributed: bigint; // 10% to DAOs
  remainderAmount: bigint; // 90% to Treasury
  byDAO: Record<string, bigint>;
  byGauge: Record<GaugeCategory, bigint>;
}

export interface SpendingProposal {
  id: string;
  status: 'pending' | 'approved' | 'queued' | 'executed' | 'rejected';
  proposer: Address;
  destination: Address;
  amount: bigint;
  asset: string;
  purpose: string;
  timelockEnd?: number;
  executedAt?: number;
  attachmentHash?: string; // Report, invoice, etc.
}

export interface ExecutionReceipt {
  proposalId: string;
  destination: Address;
  amount: bigint;
  asset: string;
  executedAt: number;
  txHash: string;
  attachmentHash?: string;
}

// ============================================================================
// FEE COLLECTOR EVENTS
// ============================================================================

export interface FeesRoutedEvent {
  asset: string;
  amount: bigint;
  daoId: string;
  destination: Address;
  timestamp: number;
  txHash: string;
}

// ============================================================================
// V1 POLICY SUMMARY (for documentation)
// ============================================================================

export const V1_POLICY_SUMMARY = `
PARS-10 Cashflow Policy v1

1. Mint proceeds → Treasury DAO (T).
2. Protocol fees → FeeRouter.
3. FeeRouter sends 1% of fees to each PARS-10 DAO vault (10% total).
4. Remaining 90% → Treasury Fee Vault.
5. Treasury allocates remainder via governance-controlled gauges (changeable later).
6. Treasury can route funds into POL Vault to build protocol-owned liquidity.
7. All spending is timelocked, allowlisted, and receipt-backed in the dashboard.

Design Principles:
- Ethical finance and broad cultural compatibility
- Structures avoid interest-based mechanisms
- Fee-for-service revenue model
`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function calculateFeeDistribution(totalFees: bigint): {
  baseSplitTotal: bigint;
  perDAO: bigint;
  remainder: bigint;
} {
  const baseSplitTotal = (totalFees * BigInt(FEE_ROUTER_CONFIG.totalBaseAllocation)) / 100n;
  const perDAO = baseSplitTotal / BigInt(FEE_ROUTER_CONFIG.daoCount);
  const remainder = totalFees - baseSplitTotal;

  return {
    baseSplitTotal,
    perDAO,
    remainder,
  };
}

export function calculateGaugeAllocations(
  remainder: bigint,
  weights: GaugeWeight[],
): Record<GaugeCategory, bigint> {
  const result: Partial<Record<GaugeCategory, bigint>> = {};

  for (const gauge of weights) {
    result[gauge.category] = (remainder * BigInt(gauge.weight)) / 100n;
  }

  return result as Record<GaugeCategory, bigint>;
}

export function validateGaugeWeights(weights: GaugeWeight[]): boolean {
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  return total === 100;
}

export function canChangeWeight(
  currentWeight: number,
  proposedWeight: number,
  maxChange: number,
): boolean {
  const change = Math.abs(proposedWeight - currentWeight);
  return change <= maxChange;
}
