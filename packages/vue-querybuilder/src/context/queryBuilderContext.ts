import type { ComputedRef, InjectionKey } from 'vue';
import type { QueryBuilderContextValue } from '../types';

/** provide 的是 computed ref，子组件 inject 后 unref 使用 */
export const QUERY_BUILDER_CONTEXT_KEY: InjectionKey<
  ComputedRef<QueryBuilderContextValue>
> = Symbol('QueryBuilderContext');
