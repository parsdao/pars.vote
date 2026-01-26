import { Address } from 'viem';

export enum VentureStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FUNDING = 'funding',
  FUNDED = 'funded',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum VentureVisibility {
  PUBLIC = 'public',
  INVESTORS_ONLY = 'investors_only',
  PRIVATE = 'private',
}

export interface VentureDocument {
  id: string;
  name: string;
  url: string;
  visibility: VentureVisibility;
  uploadedAt: number;
  uploadedBy: Address;
}

export interface VentureInvestor {
  address: Address;
  commitment: bigint;
  investedAt: number;
  status: 'pending' | 'confirmed' | 'withdrawn';
}

export interface Venture {
  id: string;
  name: string;
  description: string;
  summary: string;
  category: string;
  status: VentureStatus;
  visibility: VentureVisibility;

  // Funding details
  targetRaise: bigint;
  minInvestment: bigint;
  maxInvestment: bigint;
  currentRaised: bigint;
  currency: string; // CYRUS, PARS, USDC, etc.

  // Token gate
  requiredTokenBalance: bigint; // 1M CYRUS = 1_000_000 * 10^18
  tokenAddress: Address;

  // Timeline
  createdAt: number;
  fundingStartDate: number;
  fundingEndDate: number;

  // Participants
  creator: Address;
  investors: VentureInvestor[];

  // Documents (pitch deck, financials, etc.)
  documents: VentureDocument[];

  // DAO integration
  daoAddress?: Address;
  proposalId?: string;
}

export interface CreateVentureInput {
  name: string;
  description: string;
  summary: string;
  category: string;
  targetRaise: string;
  minInvestment: string;
  maxInvestment: string;
  currency: string;
  fundingStartDate: Date;
  fundingEndDate: Date;
  visibility: VentureVisibility;
}

// Minimum CYRUS balance required to access ventures (1M CYRUS)
export const VENTURE_ACCESS_THRESHOLD = BigInt(1_000_000) * BigInt(10 ** 18);

// Token addresses
export const CYRUS_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000' as Address; // Update with actual address
