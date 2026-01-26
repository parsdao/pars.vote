import { Address } from 'viem';

/**
 * PARS Liquid Protocol Configuration
 *
 * Adapted from luxfi/standard (Shariah-compliant ALCX2 fork)
 * Core principle: Self-repaying positions where yield covers obligations (no riba)
 *
 * Reference: ~/work/lux/standard/contracts/liquid/
 */

// ============================================================================
// LIQUID PARS TOKEN STACK
// ============================================================================

/**
 * Token hierarchy:
 * CYRUS (utility) → Governance participation
 * PARS (governance) → Voting power + staking
 * xPARS (LiquidPARS shares) → Yield-bearing, auto-compounding
 * vPARS (voting power) → Derived from PARS + Karma + Time-lock
 */

export interface TokenStack {
  cyrus: {
    name: 'CYRUS';
    type: 'utility';
    description: 'Protocol utility token for access and fees';
  };
  pars: {
    name: 'PARS';
    type: 'governance';
    description: 'Core governance token with voting rights';
  };
  xPars: {
    name: 'xPARS';
    type: 'yield-bearing';
    description: 'LiquidPARS vault shares, auto-compounding yield';
    contract: 'LiquidPARS'; // Fork of LiquidLUX
  };
  vPars: {
    name: 'vPARS';
    type: 'voting-power';
    description: 'Derived voting power with karma and lock multipliers';
  };
}

// ============================================================================
// SELF-REPAYING LOAN PARAMETERS (Shariah-Compliant)
// ============================================================================

/**
 * Adapted from ~/work/lux/standard/contracts/liquid/teleport/LiquidETH.sol
 *
 * Key Shariah compliance features:
 * - No interest charged (no riba)
 * - Debt decreases as yield accrues (profit-sharing / mudarabah-like)
 * - Overcollateralized to avoid gharar (uncertainty)
 * - Asset-backed positions (murabaha-like)
 */

export interface SelfRepayingLoanParams {
  /** Maximum Loan-to-Value ratio */
  maxLTV: number;
  /** Liquidation threshold */
  liquidationThreshold: number;
  /** Liquidation bonus for liquidators */
  liquidationBonus: number;
  /** Minimum backing requirement (total collateral >= total debt) */
  backingRequirement: number;
  /** Peg degrade threshold */
  pegDegradeThreshold: number;
  /** Peg pause threshold */
  pegPauseThreshold: number;
}

export const SELF_REPAYING_PARAMS: SelfRepayingLoanParams = {
  maxLTV: 0.90,              // 90% LTV
  liquidationThreshold: 0.94, // 94% liquidation trigger
  liquidationBonus: 0.01,     // 1% liquidator incentive
  backingRequirement: 1.00,   // 100% backing at all times
  pegDegradeThreshold: 0.995, // Degrade at 99.5%
  pegPauseThreshold: 0.985,   // Pause at 98.5%
};

// ============================================================================
// LIQUID PARS VAULT (Fork of LiquidLUX)
// ============================================================================

/**
 * Master yield vault receiving all protocol fees
 * Reference: ~/work/lux/standard/contracts/liquid/LiquidLUX.sol
 */

export interface LiquidPARSVault {
  /** ERC4626 yield-bearing vault */
  standard: 'ERC4626';
  /** Governance voting enabled */
  votingEnabled: true;
  /** Fee split configuration */
  feeSplit: {
    /** To yield vault for xPARS holders */
    toYieldVault: number;
    /** To treasury for operations */
    toTreasury: number;
    /** To slashing reserve */
    toSlashingReserve: number;
  };
  /** Revenue sources */
  revenueSources: string[];
}

export const LIQUID_PARS_VAULT: LiquidPARSVault = {
  standard: 'ERC4626',
  votingEnabled: true,
  feeSplit: {
    toYieldVault: 0.89,      // 89% to yield
    toTreasury: 0.10,        // 10% to treasury (ops, R&D)
    toSlashingReserve: 0.01, // 1% to slashing reserve
  },
  revenueSources: [
    'Protocol fees (bridge, DEX, lending)',
    'Yield strategy returns',
    'Validator rewards (if applicable)',
    'Partnership revenue',
    'Grant matching (from Endowment)',
  ],
};

// ============================================================================
// YIELD STRATEGIES (Shariah-Screened)
// ============================================================================

/**
 * Adapted from ~/work/lux/standard/contracts/bridge/yield/strategies/
 *
 * Only strategies that pass Shariah screening:
 * - No lending at fixed interest (riba)
 * - No speculative derivatives (maysir)
 * - No prohibited industries (haram)
 */

export type StrategyCategory = 'staking' | 'liquidity' | 'lending-halal' | 'real-yield';

export interface YieldStrategy {
  name: string;
  category: StrategyCategory;
  expectedAPY: { min: number; max: number };
  shariahCompliant: boolean;
  shariahNotes: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const APPROVED_STRATEGIES: YieldStrategy[] = [
  {
    name: 'Lido stETH',
    category: 'staking',
    expectedAPY: { min: 0.035, max: 0.05 },
    shariahCompliant: true,
    shariahNotes: 'Proof-of-stake validation rewards (halal)',
    riskLevel: 'low',
  },
  {
    name: 'EigenLayer Restaking',
    category: 'staking',
    expectedAPY: { min: 0.02, max: 0.08 },
    shariahCompliant: true,
    shariahNotes: 'Security service fees (halal)',
    riskLevel: 'medium',
  },
  {
    name: 'Curve/Balancer LP',
    category: 'liquidity',
    expectedAPY: { min: 0.02, max: 0.15 },
    shariahCompliant: true,
    shariahNotes: 'Market-making fees (halal service fee)',
    riskLevel: 'medium',
  },
  {
    name: 'MakerDAO sDAI',
    category: 'lending-halal',
    expectedAPY: { min: 0.05, max: 0.10 },
    shariahCompliant: false, // Requires review
    shariahNotes: 'DSR has riba concerns - needs halal wrapper',
    riskLevel: 'low',
  },
  {
    name: 'Pendle PT/YT',
    category: 'real-yield',
    expectedAPY: { min: 0.05, max: 0.20 },
    shariahCompliant: true,
    shariahNotes: 'Yield tokenization (profit-sharing structure)',
    riskLevel: 'high',
  },
  {
    name: 'PARS Protocol Fees',
    category: 'real-yield',
    expectedAPY: { min: 0.03, max: 0.08 },
    shariahCompliant: true,
    shariahNotes: 'Protocol usage fees (halal service revenue)',
    riskLevel: 'low',
  },
];

// Only use Shariah-compliant strategies
export const HALAL_STRATEGIES = APPROVED_STRATEGIES.filter(s => s.shariahCompliant);

// ============================================================================
// GOVERNANCE PARAMETERS
// ============================================================================

/**
 * Adapted from ~/work/lux/standard/docs/architecture/governance-math-analysis.md
 *
 * Voting power formula:
 * vPARS = PARS × sqrt(K/100) × (1 + lock_months × 0.1)
 * Maximum boost: 3.16x (Karma) × 4.0x (time lock) = 12.64x
 */

export interface GovernanceParams {
  /** Voting period in days */
  votingPeriodDays: number;
  /** Quorum threshold (votes needed) */
  quorumThreshold: number;
  /** Approval threshold (% of votes for pass) */
  approvalThreshold: number;
  /** Timelock delay in days */
  timelockDays: { min: number; max: number };
  /** Karma multiplier formula */
  karmaFormula: string;
  /** Time-lock multiplier formula */
  timeLockFormula: string;
  /** Maximum voting power boost */
  maxBoost: number;
}

export const GOVERNANCE_PARAMS: GovernanceParams = {
  votingPeriodDays: 7,
  quorumThreshold: 1_000_000, // 1M vPARS votes
  approvalThreshold: 0.50,    // 50% approval
  timelockDays: { min: 2, max: 7 },
  karmaFormula: 'sqrt(K/100)',
  timeLockFormula: '1 + lock_months × 0.1',
  maxBoost: 12.64, // 3.16x × 4.0x
};

/**
 * Karma decay parameters (activity-driven)
 * Reference: ~/work/lux/standard/docs/architecture/governance-math-analysis.md
 */
export interface KarmaDecay {
  /** Decay rate for active users (≥1 tx/month) */
  activeDecayPerYear: number;
  /** Decay rate for inactive users */
  inactiveDecayPerYear: number;
  /** Minimum karma for verified DIDs */
  minVerifiedKarma: number;
}

export const KARMA_DECAY: KarmaDecay = {
  activeDecayPerYear: 0.01,   // 1%/year → 90.4% retained after 10 years
  inactiveDecayPerYear: 0.10, // 10%/year → 34.9% retained after 10 years
  minVerifiedKarma: 50,       // Prevents long-term decay to zero
};

// ============================================================================
// PARS-10 SPECIFIC CONFIGURATION
// ============================================================================

/**
 * PARS-10 DAO revenue allocation
 * Combines LiquidPARS with the DAO budget system
 */

export interface PARS10RevenueConfig {
  /** Revenue after LiquidPARS split goes to PARS-10 */
  daoRevenueShare: number;
  /** Initial equal weights for bootstrap */
  bootstrapWeights: Record<string, number>;
  /** Epoch duration for weight adjustments */
  epochWeeks: number;
  /** Max weight change per epoch */
  maxWeightChange: number;
}

export const PARS_10_REVENUE_CONFIG: PARS10RevenueConfig = {
  daoRevenueShare: 0.40, // 40% of revenue to PARS-10 DAOs
  bootstrapWeights: {
    security: 0.10,
    treasury: 0.10,
    governance: 0.10,
    health: 0.10,
    culture: 0.10,
    research: 0.10,
    infrastructure: 0.10,
    consular: 0.10,
    venture: 0.10,
    impact: 0.10,
  },
  epochWeeks: 4,
  maxWeightChange: 0.02, // ±2% per epoch
};

// ============================================================================
// CONTRACT ADDRESSES (To be deployed)
// ============================================================================

export interface ContractAddresses {
  liquidPARS: Address;
  pars: Address;
  cyrus: Address;
  gaugeController: Address;
  timelock: Address;
  strategyRouter: Address;
  ethicsModule: Address;
}

export const CONTRACT_ADDRESSES: Partial<ContractAddresses> = {
  // To be populated after deployment
  // These will be the PARS-tuned versions of luxfi/standard contracts
};

// ============================================================================
// INTEGRATION HELPERS
// ============================================================================

export function calculateVotingPower(
  parsBalance: bigint,
  karma: number,
  lockMonths: number,
): bigint {
  const karmaMultiplier = Math.sqrt(karma / 100);
  const lockMultiplier = 1 + lockMonths * 0.1;
  const totalMultiplier = Math.min(karmaMultiplier * lockMultiplier, GOVERNANCE_PARAMS.maxBoost);

  return BigInt(Math.floor(Number(parsBalance) * totalMultiplier));
}

export function getExpectedBlendedAPY(): { min: number; max: number } {
  const halalStrategies = APPROVED_STRATEGIES.filter(s => s.shariahCompliant);
  const minAPY = halalStrategies.reduce((sum, s) => sum + s.expectedAPY.min, 0) / halalStrategies.length;
  const maxAPY = halalStrategies.reduce((sum, s) => sum + s.expectedAPY.max, 0) / halalStrategies.length;

  return {
    min: minAPY * LIQUID_PARS_VAULT.feeSplit.toYieldVault,
    max: maxAPY * LIQUID_PARS_VAULT.feeSplit.toYieldVault,
  };
}
