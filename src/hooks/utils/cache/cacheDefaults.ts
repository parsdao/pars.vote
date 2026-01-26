/**
 * Cache configuration defaults for local storage
 */

export enum CacheKeys {
  FAVORITES = 'favorites',
  PROPOSALS = 'proposals',
  METADATA = 'metadata',
  HATS_TREE = 'hats_tree',
  TREASURY = 'treasury',
  ROLES = 'roles',
  DAO_INFO = 'dao_info',
  MULTISIG_METADATA_PREFIX = 'multisig_metadata_',
  DECODED_TRANSACTION_PREFIX = 'decoded_tx_',
}

export enum CacheExpiry {
  NEVER = -1,
  ONE_MINUTE = 60 * 1000,
  FIVE_MINUTES = 5 * 60 * 1000,
  FIFTEEN_MINUTES = 15 * 60 * 1000,
  ONE_HOUR = 60 * 60 * 1000,
  ONE_DAY = 24 * 60 * 60 * 1000,
  ONE_WEEK = 7 * 24 * 60 * 60 * 1000,
}

export interface CacheValue<T> {
  value: T;
  expiry: number;
}

export interface FavoritesCacheValue {
  favorites: string[];
  lastUpdated: number;
}
