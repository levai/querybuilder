import type {
  BaseOption,
  FlexibleOptionListProp,
  FullOption,
  FullOptionList,
  RuleGroupTypeAny,
  RuleType,
} from '@react-querybuilder/core';
import { prepareOptionList } from '@react-querybuilder/core';
import { reactive } from 'vue';

export const DEFAULT_CACHE_TTL = 1_800_000; // 30 minutes

export interface CachedOptionList {
  data: FullOptionList<FullOption>;
  timestamp: number;
  validUntil: number;
}

export interface AsyncOptionListsStoreState {
  cache: Record<string, CachedOptionList>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

/**
 * Global reactive store for async option lists.
 */
const asyncOptionListsStore: AsyncOptionListsStoreState = reactive({
  cache: {},
  loading: {},
  errors: {},
});

/**
 * Gets cached option list by key.
 */
export function getCacheByKey(cacheKey: string): CachedOptionList | null {
  return asyncOptionListsStore.cache[cacheKey] || null;
}

/**
 * Checks if cache is valid (not expired).
 */
export function isCacheValid(cacheKey: string, cacheTTL?: number): boolean {
  const cached = asyncOptionListsStore.cache[cacheKey];
  if (!cached) return false;
  const ttl = cacheTTL ?? DEFAULT_CACHE_TTL;
  return Date.now() - cached.timestamp < ttl;
}

/**
 * Checks if a key is currently loading.
 */
export function isLoadingByKey(cacheKey: string): boolean {
  return asyncOptionListsStore.loading[cacheKey] || false;
}

/**
 * Gets error by key.
 */
export function getErrorByKey(cacheKey: string): string | null {
  const error = asyncOptionListsStore.errors[cacheKey];
  return error && error !== '' ? error : null;
}

/**
 * Sets loading state for a key.
 */
export function setLoading(cacheKey: string, loading: boolean): void {
  asyncOptionListsStore.loading[cacheKey] = loading;
  if (loading) {
    asyncOptionListsStore.errors[cacheKey] = '';
  }
}

/**
 * Sets cached data for a key.
 */
export function setCache(
  cacheKey: string,
  data: FullOptionList<FullOption>,
  cacheTTL?: number
): void {
  const ttl = cacheTTL ?? DEFAULT_CACHE_TTL;
  asyncOptionListsStore.cache[cacheKey] = {
    data,
    timestamp: Date.now(),
    validUntil: Date.now() + ttl,
  };
  asyncOptionListsStore.loading[cacheKey] = false;
}

/**
 * Sets error for a key.
 */
export function setError(cacheKey: string, error: string): void {
  asyncOptionListsStore.errors[cacheKey] = error;
  asyncOptionListsStore.loading[cacheKey] = false;
}

/**
 * Invalidates cache for a key.
 */
export function invalidateCache(cacheKey: string): void {
  delete asyncOptionListsStore.cache[cacheKey];
  delete asyncOptionListsStore.errors[cacheKey];
}

/**
 * Clears all cache.
 */
export function clearAllCache(): void {
  asyncOptionListsStore.cache = {};
  asyncOptionListsStore.errors = {};
  asyncOptionListsStore.loading = {};
}

/**
 * Loads option list asynchronously.
 */
export async function loadOptionList(
  cacheKey: string,
  cacheTTL: number | undefined,
  value: string | undefined,
  ruleOrGroup: RuleType | RuleGroupTypeAny | undefined,
  loadOptionListFn: (
    value: string | undefined,
    meta: { ruleOrGroup?: RuleType | RuleGroupTypeAny }
  ) => Promise<FlexibleOptionListProp<BaseOption>>
): Promise<FullOptionList<FullOption>> {
  // Check if already loading
  if (isLoadingByKey(cacheKey)) {
    // Wait for existing load to complete
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (!isLoadingByKey(cacheKey)) {
          clearInterval(checkInterval);
          const cached = getCacheByKey(cacheKey);
          if (cached && isCacheValid(cacheKey, cacheTTL)) {
            resolve(cached.data);
          } else {
            const error = getErrorByKey(cacheKey);
            if (error) {
              reject(new Error(error));
            } else {
              // Retry loading
              loadOptionList(cacheKey, cacheTTL, value, ruleOrGroup, loadOptionListFn)
                .then(resolve)
                .catch(reject);
            }
          }
        }
      }, 50);
    });
  }

  // Check cache first
  const cached = getCacheByKey(cacheKey);
  if (cached && isCacheValid(cacheKey, cacheTTL)) {
    return cached.data;
  }

  // Start loading
  setLoading(cacheKey, true);

  try {
    const rawList = await loadOptionListFn(value, { ruleOrGroup });
    const data = prepareOptionList({ optionList: rawList }).optionList;
    setCache(cacheKey, data, cacheTTL);
    return data;
  } catch (error) {
    const errorMessage = (error as Error).message;
    setError(cacheKey, errorMessage);
    throw error;
  }
}
