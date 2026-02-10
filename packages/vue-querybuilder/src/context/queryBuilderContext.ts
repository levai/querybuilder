import type { FullField, RuleGroupTypeAny } from '@react-querybuilder/core';
import type { InjectionKey, Ref } from 'vue';
import type { QueryBuilderContextProps, Schema } from '../types';

export interface QueryBuilderContextType<
  F extends FullField = FullField,
  O extends string = string,
> extends QueryBuilderContextProps<F, O> {
  initialQuery?: RuleGroupTypeAny;
  qbId?: string;
  schema?: Ref<Schema<F, O>>;
}

/**
 * Injection key for QueryBuilder context.
 * Used with provide/inject to pass context to child components.
 */
export const QUERY_BUILDER_CONTEXT_KEY: InjectionKey<Ref<QueryBuilderContextType>> = Symbol(
  'QueryBuilderContext'
) as InjectionKey<Ref<QueryBuilderContextType>>;
