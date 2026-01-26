import { Address } from 'viem';

/**
 * PARS DAO Ecosystem
 *
 * Hierarchy:
 * - MIGA Token: Main governance token, mintable on Solana, omnichain via Wormhole
 * - CYRUS Token: Cultural/heritage token tied to cyrus.money
 * - PARS DAO: Parent governance DAO overseeing the PARS-10 network
 * - PARS-10 Sub-DAOs: Specialized operational DAOs
 *
 * Token Buckets:
 * - Working Treasury (WT): liquid budget for 12-24 month operations
 * - Endowment (END): long-horizon reserve, governed with timelocks
 *
 * Rule: Each DAO gets WT allocation. Only Treasury can move END via timelocked proposals.
 */

// Token DAO type for top-level token governance
export interface TokenDAO {
  id: string;
  name: string;
  symbol: string;
  persianName: string;
  description: string;
  website: string;
  chains: string[];
  primaryChain: string;
  totalSupply: string;
  status: 'active' | 'bootstrap' | 'coming-soon';
  features: string[];
}

// MIGA Token - Main omnichain governance token
export const MIGA_TOKEN_DAO: TokenDAO = {
  id: 'miga',
  name: 'MIGA Protocol',
  symbol: 'MIGA',
  persianName: 'میگا',
  description: 'Main governance token for the PARS ecosystem. Mintable on Solana, bridgeable to 7 chains. Governed by Pars.Network.',
  website: 'https://migaprotocol.xyz',
  chains: ['Solana', 'Ethereum', 'Base', 'Arbitrum', 'Polygon', 'Lux', 'Bitcoin (Runes)'],
  primaryChain: 'Solana',
  totalSupply: '1,000,000,000',
  status: 'active',
  features: [
    'Solana-first mint with bonding curve',
    '7-chain omnichain leaderboard',
    'vePARS governance on Pars.Network',
    'Race to Nowruz competition',
    'No VCs, no presales, no team allocation',
  ],
};

// CYRUS Token - Cultural/heritage token
export const CYRUS_TOKEN_DAO: TokenDAO = {
  id: 'cyrus',
  name: 'CYRUS DAO',
  symbol: 'CYRUS',
  persianName: 'کوروش',
  description: 'Cultural heritage token honoring Cyrus the Great. 7B supply across 7 chains. Governed by Pars.Network.',
  website: 'https://cyrus.money',
  chains: ['Solana', 'Ethereum', 'Base', 'Arbitrum', 'Polygon', 'Lux', 'Bitcoin (Runes)'],
  primaryChain: 'Solana',
  totalSupply: '7,000,000,000', // 7B across 7 chains
  status: 'active',
  features: [
    'Heritage preservation funding',
    'Cultural grants program',
    'Persian language initiatives',
    'Pars.Network governance',
    '7-chain omnichain support',
  ],
};

// All token DAOs
export const TOKEN_DAOS: TokenDAO[] = [MIGA_TOKEN_DAO, CYRUS_TOKEN_DAO];

export type TreasuryBucket = 'working' | 'endowment';

export interface TreasuryAllocation {
  bucket: TreasuryBucket;
  percentage: number; // % of Working Treasury
  description: string;
}

export type SubDAOCategory =
  | 'security'
  | 'treasury'
  | 'governance'
  | 'health'
  | 'culture'
  | 'research'
  | 'infrastructure'
  | 'consular'
  | 'venture'
  | 'impact';

export type GovernanceType = 'multisig' | 'token-voting' | 'hybrid' | 'guardian';

export interface DAOOutput {
  name: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on-demand';
  description: string;
}

export interface DAOOwnership {
  name: string;
  description: string;
}

export interface SubDAO {
  id: string;
  name: string;
  persianName: string;
  mandate: string;
  category: SubDAOCategory;
  icon: string;
  address?: Address;

  // Funding
  workingTreasuryPercent: number;
  hasEndowmentRole: boolean;

  // Governance
  governanceType: GovernanceType;
  status: 'active' | 'bootstrap' | 'coming-soon';

  // Capabilities
  owns: DAOOwnership[];
  outputs: DAOOutput[];

  // Bootstrap (first 90 days)
  bootstrapInitiatives: string[];
  minimumViableCapabilities: string[];
}

// Endowment constraints (institution-ready)
export const ENDOWMENT_RULES = {
  maxQuarterlyDeployment: 0.05, // 5% max per quarter
  riskBuckets: ['cash-usts', 'blue-chip', 'strategic', 'venture'] as const,
  requiresConflictDisclosure: true,
  requiresRecusal: true,
  largeDeploymentThreshold: 0.02, // 2% requires PARS DAO ratification
  timelockDays: {
    small: 3,
    medium: 7,
    large: 14,
    critical: 30,
  },
};

// Main Cyrus DAO configuration
export const CYRUS_MAIN_DAO = {
  name: 'Cyrus DAO',
  persianName: 'سازمان کوروش',
  description: 'Parent governance DAO overseeing the PARS-10 sub-DAO network. Manages constitutional evolution and cross-DAO coordination.',
  treasuryBuckets: {
    working: {
      name: 'Working Treasury',
      persianName: 'خزانه عملیاتی',
      description: 'Liquid budget for 12-24 month operations',
      targetRunwayMonths: 24,
    },
    endowment: {
      name: 'Endowment',
      persianName: 'وقف',
      description: 'Long-horizon reserve with strict governance',
      targetPercentOfTotal: 0.6, // 60% locked in endowment
    },
  },
};

// PARS-10 Sub-DAOs
export const PARS_10_DAOS: SubDAO[] = [
  {
    id: 'security',
    name: 'Security DAO',
    persianName: 'امنیّت',
    mandate: 'Coercion resistance, private governance, threshold custody, threat-mode operations.',
    category: 'security',
    icon: 'Shield',
    workingTreasuryPercent: 8,
    hasEndowmentRole: false,
    governanceType: 'multisig',
    status: 'bootstrap',
    owns: [
      { name: 'Privacy Modules', description: 'Zero-knowledge and privacy-preserving infrastructure' },
      { name: 'Key Rotation Policy', description: 'Cryptographic key management and rotation schedules' },
      { name: 'Relayers/Paymasters', description: 'Gas abstraction and transaction relay rules' },
      { name: 'Incident Process', description: 'Security incident response and escalation procedures' },
    ],
    outputs: [
      { name: 'Quarterly Posture Report', frequency: 'quarterly', description: 'Security status and threat assessment' },
      { name: 'Incident Logs', frequency: 'on-demand', description: 'Documented security events and responses' },
      { name: 'Audit Plans', frequency: 'quarterly', description: 'Scheduled security audits and scope' },
    ],
    bootstrapInitiatives: [
      'Threat model documentation',
      'Initial key ceremony',
      'First audit scope definition',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'Emergency response playbook',
    ],
  },
  {
    id: 'treasury',
    name: 'Treasury DAO',
    persianName: 'خزانه',
    mandate: 'Vaults, accounting, audits, execution, receipts management.',
    category: 'treasury',
    icon: 'Vault',
    workingTreasuryPercent: 12,
    hasEndowmentRole: true,
    governanceType: 'hybrid',
    status: 'bootstrap',
    owns: [
      { name: 'Timelock + Execution Router', description: 'Transaction allowlists and execution delays' },
      { name: 'Vault Factory', description: 'Standardized vault deployment and management' },
      { name: 'Reporting Schema', description: 'Financial reporting standards and templates' },
    ],
    outputs: [
      { name: 'Budget vs Actual', frequency: 'monthly', description: 'Variance analysis of planned vs spent' },
      { name: 'Receipts Ledger', frequency: 'weekly', description: 'On-chain transaction receipts' },
      { name: 'Monthly Disclosures', frequency: 'monthly', description: 'Public financial transparency reports' },
    ],
    bootstrapInitiatives: [
      'Vault deployment for all 10 DAOs',
      'Receipts standard definition',
      'First monthly disclosure',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'Budget tracking system',
    ],
  },
  {
    id: 'governance',
    name: 'Governance DAO',
    persianName: 'داد',
    mandate: 'Charter, rules, disputes, constraints, constitutional evolution.',
    category: 'governance',
    icon: 'Scales',
    workingTreasuryPercent: 4,
    hasEndowmentRole: false,
    governanceType: 'guardian', // Supreme Council acts as guardian initially
    status: 'bootstrap',
    owns: [
      { name: 'Charter Registry', description: 'Constitutional documents and amendments' },
      { name: 'Proposal Standards', description: 'Templates and requirements for governance proposals' },
      { name: 'Dispute Process', description: 'Conflict resolution and arbitration procedures' },
    ],
    outputs: [
      { name: 'Charter Updates', frequency: 'on-demand', description: 'Constitutional amendments and ratifications' },
      { name: 'Governance Research', frequency: 'quarterly', description: 'Best practices and improvement proposals' },
      { name: 'Dispute Resolutions', frequency: 'on-demand', description: 'Documented conflict outcomes' },
    ],
    bootstrapInitiatives: [
      'Charter v1 ratification',
      'Proposal standards documentation',
      'Supreme Council formation',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'Charter document',
    ],
  },
  {
    id: 'health',
    name: 'Health DAO',
    persianName: 'سلامت',
    mandate: 'Humanitarian aid and health programs with privacy for beneficiaries.',
    category: 'health',
    icon: 'Heart',
    workingTreasuryPercent: 20,
    hasEndowmentRole: false,
    governanceType: 'token-voting',
    status: 'active',
    owns: [
      { name: 'Emergency Pool', description: 'Rapid-response funding triggers for crises' },
      { name: 'Operator Registry', description: 'Vetted partners with private details, public totals' },
      { name: 'Beneficiary Privacy', description: 'Protected identity systems for aid recipients' },
    ],
    outputs: [
      { name: 'Verified Delivery', frequency: 'weekly', description: 'Proof of aid distribution' },
      { name: 'Impact Scorecards', frequency: 'monthly', description: 'Measurable humanitarian outcomes' },
      { name: 'Partner Reports', frequency: 'quarterly', description: 'NGO partner performance reviews' },
    ],
    bootstrapInitiatives: [
      '1 relief partner onboarding',
      '1 protected-beneficiary program (privacy-first)',
      'Emergency response protocol',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'First aid delivery with receipts',
    ],
  },
  {
    id: 'culture',
    name: 'Culture DAO',
    persianName: 'فرهنگ',
    mandate: 'Arts, heritage, creators, media, entertainment.',
    category: 'culture',
    icon: 'Scroll',
    workingTreasuryPercent: 10,
    hasEndowmentRole: false,
    governanceType: 'token-voting',
    status: 'active',
    owns: [
      { name: 'Creator Grants', description: 'Funding for artists, filmmakers, musicians' },
      { name: 'Events Program', description: 'Cultural festivals, exhibitions, performances' },
      { name: 'Archives', description: 'Digital preservation of Persian heritage' },
      { name: 'Translation Initiative', description: 'Making Persian culture accessible globally' },
    ],
    outputs: [
      { name: 'Cultural Programming Metrics', frequency: 'monthly', description: 'Reach, content outputs, community growth' },
      { name: 'Grant Reports', frequency: 'quarterly', description: 'Creator program outcomes' },
      { name: 'Archive Additions', frequency: 'monthly', description: 'New heritage items preserved' },
    ],
    bootstrapInitiatives: [
      'Flagship creator program (film/music)',
      'Diaspora community campaign',
      'First cultural event sponsorship',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'First creator grant with receipts',
    ],
  },
  {
    id: 'research',
    name: 'Research DAO',
    persianName: 'دانش',
    mandate: 'Scholarships, curriculum, research grants, think tank network.',
    category: 'research',
    icon: 'GraduationCap',
    workingTreasuryPercent: 8,
    hasEndowmentRole: false,
    governanceType: 'token-voting',
    status: 'active',
    owns: [
      { name: 'Grant Scoring Rubrics', description: 'Transparent evaluation criteria' },
      { name: 'Peer Review System', description: 'Academic quality assurance' },
      { name: 'Open Research Repository', description: 'Public access to funded research' },
    ],
    outputs: [
      { name: 'Publications', frequency: 'quarterly', description: 'Research papers and reports' },
      { name: 'Fellowships', frequency: 'annual', description: 'Scholar support programs' },
      { name: 'Curricula', frequency: 'annual', description: 'Educational materials developed' },
      { name: 'Policy Drafts', frequency: 'on-demand', description: 'Evidence-based policy recommendations' },
    ],
    bootstrapInitiatives: [
      'First research grant program',
      'Scholarship criteria definition',
      'Think tank partnership',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'First research grant with deliverables',
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure DAO',
    persianName: 'سازندگی',
    mandate: 'Capacity building: logistics, civic rails, platforms, tooling.',
    category: 'infrastructure',
    icon: 'Buildings',
    workingTreasuryPercent: 12,
    hasEndowmentRole: false,
    governanceType: 'hybrid',
    status: 'bootstrap',
    owns: [
      { name: 'Procurement Frameworks', description: 'Vendor selection and contracting standards' },
      { name: 'Build Contracts', description: 'Development agreements and milestones' },
      { name: 'Infrastructure Programs', description: 'Platform and tooling initiatives' },
    ],
    outputs: [
      { name: 'Capability Map', frequency: 'quarterly', description: 'Infrastructure status and gaps' },
      { name: 'Delivered Systems', frequency: 'on-demand', description: 'Completed builds and deployments' },
      { name: 'Partner Integrations', frequency: 'monthly', description: 'Third-party system connections' },
    ],
    bootstrapInitiatives: [
      'Core platform deployment',
      'Developer tooling setup',
      'First integration partnership',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'First system deployment',
    ],
  },
  {
    id: 'consular',
    name: 'Consular DAO',
    persianName: 'پیام',
    mandate: 'Partnerships (NGOs/corps/govs), MoUs, foreign relations, diaspora chapters.',
    category: 'consular',
    icon: 'Handshake',
    workingTreasuryPercent: 10,
    hasEndowmentRole: false,
    governanceType: 'multisig',
    status: 'active',
    owns: [
      { name: 'Partner Credential Registry', description: 'Verified partner identities and credentials' },
      { name: 'MoU Hash Registry', description: 'Public agreement hashes for transparency' },
      { name: 'Private Annex Storage', description: 'Confidential partnership details' },
    ],
    outputs: [
      { name: 'Partner Directory', frequency: 'monthly', description: 'Active partnership listing' },
      { name: 'Treaty Ledger', frequency: 'on-demand', description: 'Signed agreements and status' },
      { name: 'PPP Pipeline', frequency: 'quarterly', description: 'Public-private partnership opportunities' },
    ],
    bootstrapInitiatives: [
      'PPP/MoU template creation',
      'Partner onboarding pipeline',
      'First NGO partnership',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'First partnership signed',
    ],
  },
  {
    id: 'venture',
    name: 'Venture DAO',
    persianName: 'وقف',
    mandate: 'Endowment-style investing for sustainability and capacity building.',
    category: 'venture',
    icon: 'Rocket',
    workingTreasuryPercent: 6,
    hasEndowmentRole: true, // Steward of END
    governanceType: 'hybrid',
    status: 'active',
    owns: [
      { name: 'Portfolio Registry', description: 'Public investment summaries' },
      { name: 'Risk Limits', description: 'Investment constraints and thresholds' },
      { name: 'Conflicts Policy', description: 'Disclosure and recusal requirements' },
    ],
    outputs: [
      { name: 'Quarterly Portfolio Report', frequency: 'quarterly', description: 'Holdings and performance' },
      { name: 'Risk Disclosures', frequency: 'quarterly', description: 'Exposure analysis' },
      { name: 'Returns-to-Mission', frequency: 'annual', description: 'Impact of investments on mission' },
    ],
    bootstrapInitiatives: [
      'Investment policy ratification',
      'Risk framework definition',
      'First strategic investment',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'Portfolio tracking system',
    ],
  },
  {
    id: 'impact',
    name: 'Impact DAO',
    persianName: 'میزان',
    mandate: 'Independent oversight, anti-corruption, ESG-grade reporting, operator scoring.',
    category: 'impact',
    icon: 'ChartLine',
    workingTreasuryPercent: 10,
    hasEndowmentRole: false,
    governanceType: 'token-voting',
    status: 'bootstrap',
    owns: [
      { name: 'Audit Standards', description: 'Verification and compliance criteria' },
      { name: 'KPI Schema', description: 'Performance measurement framework' },
      { name: 'Anomaly Detection', description: 'Fraud and corruption monitoring' },
      { name: 'Verification Pipelines', description: 'Automated compliance checks' },
    ],
    outputs: [
      { name: 'State of the DAO Report', frequency: 'monthly', description: 'Comprehensive health assessment' },
      { name: 'Integrity Ratings', frequency: 'quarterly', description: 'DAO and operator scores' },
      { name: 'ESG Pack', frequency: 'quarterly', description: 'Environmental, social, governance metrics' },
    ],
    bootstrapInitiatives: [
      'First ESG report publication',
      'Receipts standard definition',
      'Anomaly detection system',
    ],
    minimumViableCapabilities: [
      '1 vault + 1 proposal type + 1 reporting template',
      'Operator registry',
      'First audit report',
    ],
  },
];

// Category metadata for UI
export const CATEGORY_INFO: Record<SubDAOCategory, { label: string; labelPersian: string; color: string }> = {
  security: { label: 'Security', labelPersian: 'امنیّت', color: 'red' },
  treasury: { label: 'Treasury', labelPersian: 'خزانه', color: 'yellow' },
  governance: { label: 'Governance', labelPersian: 'داد', color: 'purple' },
  health: { label: 'Health', labelPersian: 'سلامت', color: 'green' },
  culture: { label: 'Culture', labelPersian: 'فرهنگ', color: 'orange' },
  research: { label: 'Research', labelPersian: 'دانش', color: 'blue' },
  infrastructure: { label: 'Infrastructure', labelPersian: 'سازندگی', color: 'gray' },
  consular: { label: 'Consular', labelPersian: 'پیام', color: 'teal' },
  venture: { label: 'Venture', labelPersian: 'وقف', color: 'pink' },
  impact: { label: 'Impact', labelPersian: 'میزان', color: 'cyan' },
};

// Funding summary helper
export function getFundingSummary() {
  const total = PARS_10_DAOS.reduce((sum, dao) => sum + dao.workingTreasuryPercent, 0);
  return {
    totalPercent: total,
    byDAO: PARS_10_DAOS.map(dao => ({
      id: dao.id,
      name: dao.name,
      persianName: dao.persianName,
      percent: dao.workingTreasuryPercent,
    })),
  };
}

// Status helpers
export function getActiveDAOs() {
  return PARS_10_DAOS.filter(dao => dao.status === 'active');
}

export function getBootstrapDAOs() {
  return PARS_10_DAOS.filter(dao => dao.status === 'bootstrap');
}

export function getDAOById(id: string) {
  return PARS_10_DAOS.find(dao => dao.id === id);
}
