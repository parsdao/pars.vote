import { Address } from 'viem';

/**
 * PARS Privacy Architecture
 *
 * Multi-chain privacy model:
 * - Base (public): Governance UI, fee routing, receipt anchors
 * - Lux X-chain (private): Shielded UTXO treasury, private disbursements
 * - Lux t-chain/ThresholdVM: TFHE voting, threshold custody, authorization
 *
 * Core principle: Publicly auditable governance + private participation + private disbursements
 */

// ============================================================================
// CHAIN ROLES
// ============================================================================

export type ChainRole = 'public-governance' | 'private-funds' | 'crypto-control';

export interface ChainConfig {
  id: string;
  name: string;
  role: ChainRole;
  chainId: number;
  rpcUrl?: string;
  explorerUrl?: string;
  description: string;
  guarantees: string[];
}

export const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  base: {
    id: 'base',
    name: 'Base',
    role: 'public-governance',
    chainId: 8453,
    explorerUrl: 'https://basescan.org',
    description: 'Public governance, fee routing, receipt anchors',
    guarantees: [
      'Everything that matters is verifiable publicly',
      'Sensitive details can be hidden while governance is transparent',
    ],
  },
  'lux-z': {
    id: 'lux-z',
    name: 'Lux Z-Chain (zkvm)',
    role: 'private-funds',
    chainId: 96371, // Lux Z-chain
    description: 'ZK UTXO treasury, private disbursements with viewing keys',
    guarantees: [
      'Observers see aggregate flows and governed releases',
      'Cannot map individual recipients without viewing key',
      'ZK proofs verify validity without revealing details',
      'Nullifier-based double-spend prevention',
    ],
  },
  'lux-t': {
    id: 'lux-t',
    name: 'Lux t-chain (ThresholdVM)',
    role: 'crypto-control',
    chainId: 96370, // Lux t-chain
    description: 'TFHE voting, threshold custody, authorization',
    guarantees: [
      'No single admin key can deanonymize voters',
      'No single key can move shielded funds unilaterally',
      'Threshold consensus for all sensitive operations',
    ],
  },
};

// ============================================================================
// PRIVACY MODES
// ============================================================================

export type PrivacyMode = 'public' | 'protected';

export interface PrivacyModeConfig {
  mode: PrivacyMode;
  label: string;
  description: string;
  features: string[];
  warnings?: string[];
}

export const PRIVACY_MODES: Record<PrivacyMode, PrivacyModeConfig> = {
  public: {
    mode: 'public',
    label: 'Public',
    description: 'Normal Base wallet flows',
    features: [
      'Direct wallet connection',
      'Standard gas payment',
      'Visible transaction history',
      'Full governance participation',
    ],
  },
  protected: {
    mode: 'protected',
    label: 'Protected',
    description: 'Relayed + minimal metadata + safer defaults',
    features: [
      'Relayed transactions (no direct gas payment)',
      'Encrypted ballots for voting',
      'Minimal metadata exposure',
      'Anti-linkability protections',
    ],
    warnings: [
      'May have higher latency',
      'Requires relayer availability',
    ],
  },
};

// ============================================================================
// PRIVATE VOTING (TFHE)
// ============================================================================

/**
 * Private voting flow (matches LuxFHE SDK patterns):
 * 1. Proposal published publicly (Base)
 * 2. Ballots encrypted client-side (permit + encrypt)
 * 3. Tally computed under TFHE on t-chain (no plaintext votes)
 * 4. Only outcome revealed (sealed → unseal for permitted viewers)
 * 5. Outcome attested to Base via threshold signature
 */

export type VoteChoice = 'for' | 'against' | 'abstain';

export interface EncryptedBallot {
  /** Proposal ID */
  proposalId: string;
  /** Voter's permit (proves authorization without revealing identity) */
  permit: string;
  /** Encrypted vote choice */
  encryptedVote: string;
  /** Timestamp */
  timestamp: number;
  /** Nonce for replay protection */
  nonce: string;
}

export interface SealedTallyResult {
  /** Proposal ID */
  proposalId: string;
  /** Sealed result (encrypted) */
  sealedResult: string;
  /** Can be unsealed by permitted viewers */
  unsealPermissions: string[];
  /** Threshold attestation from t-chain */
  attestation: ThresholdAttestation;
}

export interface UnsealedTallyResult {
  proposalId: string;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  totalVoters: number;
  outcome: 'passed' | 'rejected' | 'quorum-not-met';
  attestation: ThresholdAttestation;
}

export interface ThresholdAttestation {
  /** Hash of the result */
  resultHash: string;
  /** Threshold signature from t-chain validators */
  signature: string;
  /** Number of signers */
  signerCount: number;
  /** Minimum required signers */
  threshold: number;
  /** Block height on t-chain */
  blockHeight: number;
}

// ============================================================================
// CONFIDENTIAL DISBURSEMENT
// ============================================================================

/**
 * Confidential disbursement with public receipts:
 * - Authorization is public (Base): approved program, cap, category, epoch
 * - Execution is private (X-chain): actual spend to shielded recipients
 * - Verification is public: cryptographic receipt proves compliance
 */

export interface GovernanceAuthorization {
  /** Unique authorization ID */
  authorizationId: string;
  /** Program or DAO ID */
  scopeId: string;
  /** Maximum amount authorized */
  cap: bigint;
  /** Asset type */
  asset: string;
  /** Expiry timestamp */
  expiry: number;
  /** Constraints */
  constraints: AuthorizationConstraints;
  /** Proposal that created this authorization */
  proposalId: string;
  /** Status */
  status: 'active' | 'exhausted' | 'expired' | 'revoked';
}

export interface AuthorizationConstraints {
  /** Allowed asset types */
  allowedAssets: string[];
  /** Allowed program categories */
  allowedCategories: string[];
  /** Rate limits (max per period) */
  rateLimits?: {
    maxPerDay: bigint;
    maxPerWeek: bigint;
  };
  /** Allowed operators (addresses or roles) */
  allowedOperators: string[];
}

export interface ConfidentialWithdrawalRequest {
  /** Request ID */
  requestId: string;
  /** References the governance authorization */
  authorizationId: string;
  /** Encrypted recipient details */
  encryptedRecipient: string;
  /** Encrypted memo/invoice reference */
  encryptedMemo: string;
  /** Amount requested */
  amount: bigint;
  /** Asset */
  asset: string;
  /** Operator submitting the request */
  operatorId: string;
  /** Status */
  status: 'pending' | 'approved' | 'rejected' | 'executed';
}

export interface SpendAuthorization {
  /** One-time authorization ID */
  spendAuthId: string;
  /** Original withdrawal request */
  requestId: string;
  /** Threshold signature authorizing the spend */
  thresholdSignature: string;
  /** Valid until */
  validUntil: number;
  /** Can only be used once */
  used: boolean;
}

// ============================================================================
// RECEIPT ANCHORS
// ============================================================================

/**
 * Receipt anchors on Base provide public auditability
 * without revealing sensitive recipient information
 */

export interface ReceiptAnchor {
  /** Receipt ID */
  receiptId: string;
  /** Program/DAO ID */
  programId: string;
  /** Amount disbursed */
  amount: bigint;
  /** Asset */
  asset: string;
  /** Epoch/period */
  epoch: number;
  /** Attestation hash (proves validity) */
  attestationHash: string;
  /** Optional encrypted memo pointer (for authorized viewers) */
  encryptedMemoPointer?: string;
  /** Category tags */
  categoryTags: string[];
  /** Timestamp */
  timestamp: number;
  /** Transaction hash on Base */
  txHash: string;
  /** NO recipient address - that's the point */
}

export interface IntegrityPack {
  /** Period covered */
  period: { start: number; end: number };
  /** Total receipts */
  receiptCount: number;
  /** Total amount disbursed */
  totalDisbursed: bigint;
  /** By program */
  byProgram: Record<string, bigint>;
  /** Merkle root of all receipts */
  receiptsMerkleRoot: string;
  /** Signed by Impact DAO */
  impactDAOSignature: string;
  /** Published timestamp */
  publishedAt: number;
}

// ============================================================================
// SHIELDED TREASURY
// ============================================================================

export interface ShieldedVault {
  /** Vault ID */
  vaultId: string;
  /** Owner (DAO or program) */
  ownerId: string;
  /** Chain (Z-chain zkvm) */
  chain: 'lux-z';
  /** Aggregate balance (public) */
  aggregateBalance: bigint;
  /** Asset */
  asset: string;
  /** Threshold custody policy */
  custodyPolicy: ThresholdCustodyPolicy;
  /** View key holders (for selective disclosure) */
  viewKeyHolders: string[];
  /** Incoming viewing key for auditors */
  incomingViewKey?: string;
}

export interface ThresholdCustodyPolicy {
  /** Minimum signers required */
  threshold: number;
  /** Total signers */
  totalSigners: number;
  /** Required governance authorization for spends */
  requiresGovernanceAuth: boolean;
  /** Rate limits */
  rateLimits: {
    maxPerTransaction: bigint;
    maxPerDay: bigint;
    cooldownMinutes: number;
  };
}

// ============================================================================
// RELAYER CONFIGURATION
// ============================================================================

/**
 * Relayers provide:
 * - Anti-linkability (voter/proposer not linked to gas payer)
 * - Safety UX (users in threat environments don't need to acquire gas)
 */

export interface RelayerConfig {
  /** Relayer ID */
  relayerId: string;
  /** Operator (Security DAO governs) */
  operatedBy: string;
  /** Supported chains */
  chains: string[];
  /** Rate limits per user */
  rateLimits: {
    maxTxPerHour: number;
    maxGasPerDay: bigint;
  };
  /** Anomaly detection enabled */
  anomalyDetection: boolean;
  /** Status */
  status: 'active' | 'paused' | 'maintenance';
}

export interface RelayRequest {
  /** Request ID */
  requestId: string;
  /** Encrypted transaction data */
  encryptedTxData: string;
  /** Target chain */
  targetChain: string;
  /** Relayer used */
  relayerId: string;
  /** Status */
  status: 'pending' | 'relayed' | 'failed';
  /** Gas paid by relayer */
  gasPaid?: bigint;
}

// ============================================================================
// PQ COMMUNICATIONS
// ============================================================================

/**
 * Post-quantum secure communications:
 * - TLS 1.3 with hybrid key exchange (classical + ML-KEM)
 * - E2E messaging with PQ hybridization
 */

export interface PQChannelConfig {
  /** Channel ID */
  channelId: string;
  /** Participants */
  participants: string[];
  /** Key exchange algorithm */
  keyExchange: 'X25519-ML-KEM-768' | 'X25519-ML-KEM-1024';
  /** Symmetric cipher */
  symmetricCipher: 'AES-256-GCM' | 'ChaCha20-Poly1305';
  /** Created at */
  createdAt: number;
  /** Key rotation schedule (hours) */
  keyRotationHours: number;
}

// ============================================================================
// EMERGENCY CONTROLS
// ============================================================================

export interface ScopedFreeze {
  /** Freeze ID */
  freezeId: string;
  /** Scope (program, vault, relayer, etc.) */
  scope: {
    type: 'program' | 'vault' | 'relayer' | 'global';
    targetId: string;
  };
  /** Triggered by */
  triggeredBy: string; // Security DAO
  /** Reason */
  reason: string;
  /** Auto-expiry timestamp */
  expiresAt: number;
  /** Status */
  status: 'active' | 'expired' | 'lifted';
  /** Requires postmortem if lifted */
  requiresPostmortem: boolean;
}

// ============================================================================
// MODULE REGISTRY (Per-Chain)
// ============================================================================

export interface ModuleRegistry {
  base: BaseModules;
  luxT: LuxTModules;
  luxZ: LuxZModules;
}

export interface BaseModules {
  /** Hash-anchored constitution text */
  charterRegistry: Address;
  /** Proposal types + bounded params */
  proposalTypes: Address;
  /** Fee routing (1% each DAO) */
  feeRouter: Address;
  /** Execution allowlists */
  executionRouter: Address;
  /** Timelocks (per risk class) */
  timelocks: {
    ops: Address;
    pol: Address;
    emergency: Address;
  };
  /** Receipt anchor events */
  receiptAnchor: Address;
  /** Bridge to X-chain */
  bridgeRouter?: Address;
}

export interface LuxTModules {
  /** TFHE private voting */
  privateVoting: Address;
  /** Threshold custody */
  thresholdCustody: Address;
  /** Confidential authorization */
  confidentialAuth: Address;
  /** Emergency controls */
  emergencyModule: Address;
}

export interface LuxZModules {
  /** Per-DAO shielded vaults (ZK UTXO) */
  shieldedVaults: Record<string, Address>;
  /** Deposit adapters (transparent → shielded) */
  depositAdapter: Address;
  /** Spend adapters (shielded → recipient) */
  spendAdapter: Address;
  /** View key controller for selective disclosure */
  viewKeyController: Address;
  /** Nullifier registry for double-spend prevention */
  nullifierRegistry: Address;
  /** ZK proof verifier */
  proofVerifier: Address;
  /** Address manager for private addresses */
  addressManager: Address;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function isProtectedMode(mode: PrivacyMode): boolean {
  return mode === 'protected';
}

export function getChainByRole(role: ChainRole): ChainConfig | undefined {
  return Object.values(CHAIN_CONFIGS).find(c => c.role === role);
}

export function canViewShieldedDetails(
  userRole: string,
  viewKeyHolders: string[],
): boolean {
  return viewKeyHolders.includes(userRole);
}

export function isAuthorizationValid(auth: GovernanceAuthorization): boolean {
  if (auth.status !== 'active') return false;
  if (Date.now() > auth.expiry) return false;
  return true;
}

export function calculateRemainingCap(
  auth: GovernanceAuthorization,
  spent: bigint,
): bigint {
  return auth.cap - spent;
}
