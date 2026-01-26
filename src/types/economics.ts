import { Address } from 'viem';

/**
 * PARS Economic Model
 *
 * Separates:
 * - POL Principal Allocation (ownership/custody)
 * - Revenue/Yield Routing (ongoing value flows)
 * - Program Budget Weights (spend allocation)
 */

// ============================================================================
// POL PRINCIPAL ALLOCATION (Ownership)
// ============================================================================

export interface POLAllocation {
  /** 1% of POL principal escrowed to each DAO (10% total) */
  perDAOPercent: number;
  /** 90% stays in central POL vault */
  centralVaultPercent: number;
  /** Total DAO allocation (should equal perDAOPercent * 10) */
  totalDAOAllocation: number;
}

export const POL_PRINCIPAL_ALLOCATION: POLAllocation = {
  perDAOPercent: 1,
  centralVaultPercent: 90,
  totalDAOAllocation: 10,
};

// ============================================================================
// REVENUE ROUTING (Yield/Fees Split)
// ============================================================================

export type HolderDistributionMethod =
  | 'fee-claim'        // Direct fee claim by token holders (recommended for Shariah compliance)
  | 'staking-rewards'  // Staking rewards in stablecoin
  | 'buyback-burn';    // Buyback and burn (less preferred for ethical finance)

export interface RevenueRouting {
  /** 50% of protocol revenue → Holder distribution */
  holderDistributionPercent: number;
  /** How holders receive their share */
  holderDistributionMethod: HolderDistributionMethod;
  /** 40% of protocol revenue → DAO programs (Treasury allocates via gauges) */
  daoProgramsPercent: number;
  /** 10% of protocol revenue → POL compounding/reserves */
  polCompoundingPercent: number;
}

export const REVENUE_ROUTING: RevenueRouting = {
  holderDistributionPercent: 50,
  holderDistributionMethod: 'fee-claim', // Shariah-compatible
  daoProgramsPercent: 40,
  polCompoundingPercent: 10,
};

// ============================================================================
// PROTOCOL FEE DISTRIBUTION (1% per DAO)
// ============================================================================

/**
 * Simple fee distribution model:
 * - 1% of all protocol fees goes to each DAO (10 DAOs × 1% = 10%)
 * - Remaining 90% distributed per governance vote
 * - Builds POL and funds each DAO as protocol is adopted
 *
 * Shariah compliant by design (via Lux Liquid Protocol):
 * - Fee-for-service model (halal)
 * - No interest/riba
 * - Profit-sharing structure
 */

export interface ProtocolFeeDistribution {
  /** Fixed 1% per DAO (10% total) */
  perDAOFixedPercent: number;
  /** Number of DAOs receiving fixed allocation */
  daoCount: number;
  /** Remaining % distributed via governance */
  governanceDistributablePercent: number;
  /** Protocol treasury reserve */
  protocolReservePercent: number;
}

export const PROTOCOL_FEE_DISTRIBUTION: ProtocolFeeDistribution = {
  perDAOFixedPercent: 1,
  daoCount: 10,
  governanceDistributablePercent: 80, // 80% can be voted on
  protocolReservePercent: 10, // 10% to protocol reserve/POL
};

// ============================================================================
// MINT REVENUE HANDLING
// ============================================================================

/**
 * All mint sales (NFT, token sales, etc.) go directly to Treasury DAO
 * Treasury DAO then allocates via governance votes
 *
 * This enables:
 * - Centralized fund collection during mint phases
 * - Democratic allocation as funds are raised
 * - Transparent tracking of mint revenue
 * - Flexible spending as adoption grows
 */

export interface MintRevenueConfig {
  /** All mint revenue goes to Treasury DAO */
  recipient: 'treasury';
  /** Treasury DAO address (to be set) */
  treasuryDAOId: string;
  /** Minimum proposal threshold for spending (% of treasury) */
  minProposalThreshold: number;
  /** Emergency fund reserve (% kept liquid) */
  emergencyReservePercent: number;
}

export const MINT_REVENUE_CONFIG: MintRevenueConfig = {
  recipient: 'treasury',
  treasuryDAOId: 'treasury',
  minProposalThreshold: 0.5, // 0.5% min for spending proposals
  emergencyReservePercent: 10, // 10% always kept liquid
};

// ============================================================================
// SHARIAH COMPLIANCE (Built-in via Lux Liquid Protocol)
// ============================================================================

/**
 * Shariah compliance is inherent to the Lux ecosystem:
 * - Liquid Protocol was designed as ALCX2 fork with Shariah compliance
 * - No interest-based lending (riba) - uses self-repaying mechanisms
 * - Fee-for-service revenue model (halal)
 * - Profit-sharing structure (mudarabah-like)
 * - Asset-backed positions (murabaha-like)
 *
 * This makes the protocol legally accessible in:
 * - Iran (majority Muslim population)
 * - Other Muslim-majority nations
 * - Islamic finance institutions globally
 */

export interface ShariahComplianceStatus {
  /** Protocol is Shariah compliant by design */
  compliant: true;
  /** Compliance mechanism */
  mechanism: 'liquid-protocol';
  /** Based on */
  basedOn: 'alcx2-fork';
  /** Legal accessibility */
  legalAccessibility: string[];
  /** Revenue model */
  revenueModel: string;
}

export const SHARIAH_COMPLIANCE: ShariahComplianceStatus = {
  compliant: true,
  mechanism: 'liquid-protocol',
  basedOn: 'alcx2-fork',
  legalAccessibility: [
    'Iran',
    'Muslim-majority nations',
    'Islamic finance institutions',
    'Ethical finance markets',
  ],
  revenueModel: 'fee-for-service (no riba)',
};

// ============================================================================
// PROGRAM BUDGET WEIGHTS (DAO Allocations)
// ============================================================================

export interface EpochBudgetConfig {
  /** Duration of each epoch in weeks */
  epochDurationWeeks: number;
  /** Bootstrap period with equal weights */
  bootstrapEpochs: number;
  /** Max weight change per epoch after bootstrap */
  maxWeightChangePerEpoch: number;
  /** Initial equal weight per DAO (10% each) */
  initialEqualWeight: number;
}

export const EPOCH_BUDGET_CONFIG: EpochBudgetConfig = {
  epochDurationWeeks: 4,
  bootstrapEpochs: 3, // 12 weeks total
  maxWeightChangePerEpoch: 2, // ±2% per epoch after bootstrap
  initialEqualWeight: 10,
};

export interface DAOBudgetWeight {
  daoId: string;
  currentWeight: number;
  minWeight: number;
  maxWeight: number;
}

// ============================================================================
// ETHICAL FINANCE CONSTRAINTS
// ============================================================================

export interface EthicsPolicy {
  /** Prohibited revenue sources */
  prohibitedSources: string[];
  /** Allowed strategy categories */
  allowedStrategies: string[];
  /** Conflict disclosure requirements */
  conflictDisclosure: boolean;
  /** Quarterly ethics review required */
  quarterlyReview: boolean;
}

export const ETHICS_POLICY: EthicsPolicy = {
  prohibitedSources: [
    'interest-based lending (riba)',
    'gambling/speculation',
    'prohibited substances',
    'weapons manufacturing',
    'exploitative industries',
  ],
  allowedStrategies: [
    'fee-for-service revenue',
    'profit-sharing (mudarabah-like)',
    'asset-backed mechanisms (murabaha-like)',
    'overcollateralized self-repaying positions',
    'protocol usage fees',
    'liquidity provision spreads',
  ],
  conflictDisclosure: true,
  quarterlyReview: true,
};

// ============================================================================
// POL SUB-VAULT CONSTRAINTS
// ============================================================================

export interface DAOPOLVaultConstraints {
  /** DAO cannot sell POL principal */
  canSellPrincipal: false;
  /** Can claim share of yield */
  canClaimYield: true;
  /** Can propose reallocation within bounds (timelocked) */
  canProposeReallocation: true;
  /** Timelock for reallocation proposals (days) */
  reallocationTimelockDays: number;
  /** Max reallocation per proposal */
  maxReallocationPercent: number;
}

export const DAO_POL_VAULT_CONSTRAINTS: DAOPOLVaultConstraints = {
  canSellPrincipal: false,
  canClaimYield: true,
  canProposeReallocation: true,
  reallocationTimelockDays: 14,
  maxReallocationPercent: 25, // Can only move 25% of their POL allocation
};

// ============================================================================
// SAFETY RAILS
// ============================================================================

export interface SafetyRails {
  /** Timelock on all strategy changes (days) */
  strategyChangeTimelockDays: number;
  /** Emergency freeze scope */
  emergencyFreezeScope: string[];
  /** Emergency freeze expiry (hours) */
  emergencyFreezeExpiryHours: number;
  /** Monthly disclosure required */
  monthlyDisclosure: boolean;
}

export const SAFETY_RAILS: SafetyRails = {
  strategyChangeTimelockDays: 7,
  emergencyFreezeScope: [
    'POL withdrawals',
    'Large transfers (>1% treasury)',
    'Strategy router changes',
  ],
  emergencyFreezeExpiryHours: 72, // Auto-expires if not ratified
  monthlyDisclosure: true,
};

// ============================================================================
// IP & LICENSING
// ============================================================================

export interface IPRegistry {
  /** On-chain hash registry */
  hashRegistry: boolean;
  /** Off-chain legal wrapper entity */
  legalWrapper: string;
  /** DAO responsibilities */
  responsibilities: {
    treasuryDAO: string[];
    ventureDAO: string[];
    researchDAO: string[];
    consularDAO: string[];
    impactDAO: string[];
  };
}

export const IP_REGISTRY: IPRegistry = {
  hashRegistry: true,
  legalWrapper: 'Cyrus Foundation (NGO)',
  responsibilities: {
    treasuryDAO: ['Hold IP custody', 'Maintain IP registry'],
    ventureDAO: ['Fund R&D', 'Fund startups', 'Strategic investments'],
    researchDAO: ['Produce open work', 'Selectively patented work'],
    consularDAO: ['Sign partnerships', 'Licensing MoUs'],
    impactDAO: ['Audit deals', 'Conflict reviews'],
  },
};

// ============================================================================
// GOVERNANCE KIT (Replication Package)
// ============================================================================

export interface GovernanceKit {
  name: string;
  components: string[];
  description: string;
}

export const PARS_10_GOVERNANCE_KIT: GovernanceKit = {
  name: 'PARS-10 Governance Kit',
  components: [
    'Smart Contracts (Vault, Router, Gauge, Timelock)',
    'App Templates (React/Chakra UI)',
    'Operator Playbooks (program design, reporting, procurement)',
    'Ethics Module (strategy allowlists, prohibited behaviors)',
    'Privacy Module (TFHE/threshold voting, threat-mode)',
  ],
  description: 'Exportable and investable civil society governance framework for other communities/nations.',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateRevenueRouting(routing: RevenueRouting): boolean {
  const total = routing.holderDistributionPercent +
                routing.daoProgramsPercent +
                routing.polCompoundingPercent;
  return total === 100;
}

export function calculateDAOBudgetForEpoch(
  epoch: number,
  currentWeights: DAOBudgetWeight[],
  proposedChanges: { daoId: string; change: number }[],
): DAOBudgetWeight[] {
  const config = EPOCH_BUDGET_CONFIG;

  // During bootstrap, return equal weights
  if (epoch <= config.bootstrapEpochs) {
    return currentWeights.map(w => ({
      ...w,
      currentWeight: config.initialEqualWeight,
    }));
  }

  // After bootstrap, apply changes with caps
  return currentWeights.map(weight => {
    const proposedChange = proposedChanges.find(c => c.daoId === weight.daoId);
    if (!proposedChange) return weight;

    const cappedChange = Math.max(
      -config.maxWeightChangePerEpoch,
      Math.min(config.maxWeightChangePerEpoch, proposedChange.change)
    );

    const newWeight = Math.max(
      weight.minWeight,
      Math.min(weight.maxWeight, weight.currentWeight + cappedChange)
    );

    return {
      ...weight,
      currentWeight: newWeight,
    };
  });
}
