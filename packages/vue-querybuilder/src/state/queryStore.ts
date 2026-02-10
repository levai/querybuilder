import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import { current } from 'immer';
import { ref } from 'vue';

export type QueriesStoreState = Record<string, RuleGroupTypeAny>;

/**
 * Global reactive store for all QueryBuilder instances.
 * Each instance is identified by its qbId.
 * Using ref instead of reactive to avoid proxy conflicts with Immer.
 * ref.value returns plain objects, not Vue reactive proxies.
 */
const queriesStore = ref<QueriesStoreState>({});

declare global {
  var __VQB_DEVTOOLS__: boolean | undefined;
}

/**
 * Gets the query for a specific QueryBuilder instance by its ID.
 *
 * @param qbId - The unique identifier for the QueryBuilder instance
 * @returns The query object for the instance, or undefined if not found
 */
export function getQueryById(qbId: string): RuleGroupTypeAny | undefined {
  return queriesStore.value[qbId];
}

/**
 * Sets the query for a specific QueryBuilder instance.
 *
 * @param qbId - The unique identifier for the QueryBuilder instance
 * @param query - The query object to store
 */
export function setQueryById(qbId: string, query: RuleGroupTypeAny): void {
  // Convert Immer proxy to plain object to avoid proxy conflicts with Vue's reactive system
  // Functions from @react-querybuilder/core (add, remove, update) use Immer's produce,
  // which returns proxy objects. Use current() to convert proxy to plain object.
  // current() recursively handles all nested proxies automatically.
  try {
    queriesStore.value[qbId] = current(query);
  } catch {
    // If current() fails (not an Immer proxy), use the query directly
    queriesStore.value[qbId] = query;
  }
}

/**
 * Removes the query for a specific QueryBuilder instance.
 * Useful for cleanup when a QueryBuilder instance is unmounted.
 *
 * @param qbId - The unique identifier for the QueryBuilder instance
 */
export function removeQueryById(qbId: string): void {
  delete queriesStore.value[qbId];
}

/**
 * Gets the entire queries store state.
 * Useful for debugging or DevTools integration.
 *
 * @returns The entire queries store state
 */
export function getQueriesStore() {
  return queriesStore;
}

/**
 * Selector function that returns a function to get query by ID.
 * This matches the pattern used in React version for consistency.
 *
 * @param qbId - The unique identifier for the QueryBuilder instance
 * @returns A function that returns the query for the given qbId
 */
export function getQuerySelectorById(qbId: string) {
  return () => queriesStore.value[qbId];
}
