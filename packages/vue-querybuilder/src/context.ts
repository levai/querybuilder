/**
 * Vue 3 QueryBuilder context — replaces React Context with provide/inject
 */
import type { InjectionKey } from 'vue';
import type { QueryBuilderContextProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface QueryBuilderContextType extends QueryBuilderContextProps<any, any> {
  /** ID of the query builder instance */
  qbId?: string;
}

/**
 * InjectionKey for QueryBuilder context.
 * Any descendant query builders will inherit the props from a context provider.
 */
export const QueryBuilderContextKey: InjectionKey<QueryBuilderContextType> =
  Symbol('QueryBuilderContext');
