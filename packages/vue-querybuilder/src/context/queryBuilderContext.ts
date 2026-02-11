/**
 * Vue 3 QueryBuilder context — provide/inject keys for single source (queryRef + path).
 * @see REFACTOR-VUE3.md
 */
import type { InjectionKey, Ref } from 'vue';
import type { RuleGroupTypeAny } from '@react-querybuilder/core';
import type { QueryActions, Schema, TranslationsFull } from '../types';

/** 根 query 的 ref，子组件通过 findPath(queryRef.value, path) 取当前节点 */
export const QUERY_REF_KEY = Symbol(
  'vue-querybuilder-query-ref'
) as InjectionKey<Ref<RuleGroupTypeAny | null>>;

/** 更新 query 的唯一入口：(newQuery) => void */
export const DISPATCH_KEY = Symbol(
  'vue-querybuilder-dispatch'
) as InjectionKey<(query: RuleGroupTypeAny) => void>;

/** Schema、translations、actions 等只读上下文 */
export interface QueryBuilderContextType {
  schema: Ref<Schema | undefined>;
  translations?: Ref<TranslationsFull | undefined>;
  actions?: Ref<QueryActions | undefined>;
  queryRef?: Ref<RuleGroupTypeAny | null>;
  dispatch?: (query: RuleGroupTypeAny) => void;
}

export const QUERY_BUILDER_CONTEXT_KEY = Symbol(
  'vue-querybuilder-context'
) as InjectionKey<Ref<QueryBuilderContextType>>;
