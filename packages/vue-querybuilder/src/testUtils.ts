/**
 * Test helpers for Vue QueryBuilder.
 */
import { mount, type VueWrapper } from '@vue/test-utils';
import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import QueryBuilder from './components/QueryBuilder.vue';

export interface MountQueryBuilderOptions {
  defaultQuery?: RuleGroupType;
  fields?: Array<{ name: string; label: string; getMatchModes?: () => Array<{ name: string; label: string }> }>;
  accessibleDescriptionGenerator?: (params: { path: number[]; qbId: string }) => string;
  [key: string]: unknown;
}

const defaultQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
  not: false,
};

/**
 * Mount QueryBuilder with minimal required props and optional overrides.
 */
export function mountQueryBuilder(
  options: MountQueryBuilderOptions = {}
): VueWrapper {
  const {
    defaultQuery: query = defaultQuery,
    fields = [{ name: 'field1', label: 'Field 1' }],
    accessibleDescriptionGenerator,
    ...rest
  } = options;

  return mount(QueryBuilder, {
    props: {
      defaultQuery: query,
      fields,
      ...(accessibleDescriptionGenerator != null && { accessibleDescriptionGenerator }),
      ...rest,
    },
    attachTo: document.body,
  });
}

export function createRule(overrides: Partial<RuleType> = {}): RuleType {
  return {
    id: `rule-${Math.random().toString(36).slice(2, 9)}`,
    field: 'field1',
    operator: '=',
    value: '',
    ...overrides,
  };
}

export function createRuleGroup(overrides: Partial<RuleGroupType> = {}): RuleGroupType {
  return {
    id: `group-${Math.random().toString(36).slice(2, 9)}`,
    combinator: 'and',
    rules: [],
    not: false,
    ...overrides,
  };
}
