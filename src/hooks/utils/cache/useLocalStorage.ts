/**
 * Local storage utilities with expiry support
 */

import { CacheValue, CacheExpiry } from './cacheDefaults';

const CACHE_PREFIX = 'cyrus_dao_';

/**
 * Custom JSON replacer for localStorage that handles special types
 */
export function localStorageReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return { __type: 'bigint', value: value.toString() };
  }
  if (value instanceof Map) {
    return { __type: 'Map', value: Array.from(value.entries()) };
  }
  if (value instanceof Set) {
    return { __type: 'Set', value: Array.from(value) };
  }
  return value;
}

/**
 * Custom JSON reviver for localStorage that restores special types
 */
export function localStorageReviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && '__type' in value) {
    const typedValue = value as { __type: string; value: unknown };
    switch (typedValue.__type) {
      case 'bigint':
        return BigInt(typedValue.value as string);
      case 'Map':
        return new Map(typedValue.value as [unknown, unknown][]);
      case 'Set':
        return new Set(typedValue.value as unknown[]);
    }
  }
  return value;
}

export function getValue<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const cached: CacheValue<T> = JSON.parse(item);

    // Check expiry
    if (cached.expiry !== CacheExpiry.NEVER && Date.now() > cached.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return cached.value;
  } catch {
    return null;
  }
}

export function setValue<T>(
  key: string,
  value: T,
  expiry: CacheExpiry = CacheExpiry.ONE_HOUR
): void {
  try {
    const cached: CacheValue<T> = {
      value,
      expiry: expiry === CacheExpiry.NEVER ? CacheExpiry.NEVER : Date.now() + expiry,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
  } catch {
    // Storage full or unavailable
  }
}

export function removeValue(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // Ignore errors
  }
}

export function clearCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore errors
  }
}
