/**
 * PIP (PARS Improvement Proposal) Types
 *
 * These types define the structure for PIPs fetched from the GitHub repository.
 */

export type PIPStatus = 'Draft' | 'Review' | 'Voting' | 'Approved' | 'Rejected' | 'Implemented';

export type PIPType = 'Core' | 'Tokens' | 'Governance' | 'DeFi' | 'Grants' | 'Integrations' | 'Security' | 'Sub-DAOs';

export interface PIPMetadata {
  /** PIP number (e.g., "0001") */
  number: string;
  /** Full PIP title */
  title: string;
  /** Current status in the lifecycle */
  status: PIPStatus;
  /** Category type */
  type: PIPType;
  /** Creation date in ISO format */
  created: string;
  /** GitHub discussion URL */
  discussionUrl: string | null;
  /** Short description from YAML frontmatter */
  description?: string | null;
  /** Author from YAML frontmatter */
  author?: string | null;
  /** Tags from YAML frontmatter */
  tags?: string[];
}

export interface PIP extends PIPMetadata {
  /** Unique identifier (e.g., "pip-0001-constitution") */
  id: string;
  /** File name */
  fileName: string;
  /** Raw markdown content */
  content: string;
  /** Summary extracted from the PIP (first paragraph after title) */
  summary: string;
  /** GitHub raw content URL */
  rawUrl: string;
  /** GitHub repository URL */
  repoUrl: string;
  /** Associated on-chain proposal ID if one exists */
  onChainProposalId?: string;
}

export interface PIPWithVoting extends PIP {
  /** Whether there's an active on-chain vote for this PIP */
  hasActiveVote: boolean;
  /** On-chain proposal details if exists */
  onChainProposal?: {
    proposalId: string;
    state: string;
    votesFor: bigint;
    votesAgainst: bigint;
    votesAbstain: bigint;
    quorum: bigint;
    deadline: number;
  };
}

/** PIP category ranges */
export const PIP_CATEGORIES: Record<string, { range: [number, number]; description: string }> = {
  Core: { range: [0, 999], description: 'Protocol architecture, philosophy, standards' },
  Tokens: { range: [1000, 1999], description: 'Token standards, economics, distribution' },
  Governance: { range: [2000, 2999], description: 'DAO, voting, proposals, treasury' },
  DeFi: { range: [3000, 3999], description: 'Bonding, gauges, liquidity, staking' },
  Grants: { range: [4000, 4999], description: 'Community grants, diaspora programs' },
  Integrations: { range: [5000, 5999], description: 'Cross-chain, bridges, partnerships' },
  Security: { range: [6000, 6999], description: 'Audits, bug bounties, incident response' },
  'Sub-DAOs': { range: [7000, 7999], description: 'Regional chapters, working groups' },
};

/** Get category from PIP number */
export function getPIPCategory(pipNumber: string): PIPType {
  const num = parseInt(pipNumber, 10);
  for (const [category, { range }] of Object.entries(PIP_CATEGORIES)) {
    if (num >= range[0] && num <= range[1]) {
      return category as PIPType;
    }
  }
  return 'Core';
}

/** Status colors for UI */
export const PIP_STATUS_COLORS: Record<PIPStatus, string> = {
  Draft: 'gray',
  Review: 'blue',
  Voting: 'purple',
  Approved: 'green',
  Rejected: 'red',
  Implemented: 'teal',
};
