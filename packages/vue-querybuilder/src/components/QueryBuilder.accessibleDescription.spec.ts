import { describe, it, expect } from 'vitest';
import { TestID } from '@react-querybuilder/core';
import { generateAccessibleDescription } from '@react-querybuilder/core';
import { mountQueryBuilder, createRuleGroup, createRule } from '../testUtils';

describe('QueryBuilder accessibleDescription (title)', () => {
  it('root RuleGroup has title from accessibleDescriptionGenerator', () => {
    const wrapper = mountQueryBuilder({
      accessibleDescriptionGenerator: generateAccessibleDescription,
      defaultQuery: createRuleGroup({ rules: [] }),
    });
    const root = wrapper.find(`[data-testid="${TestID.ruleGroup}"]`);
    expect(root.exists()).toBe(true);
    expect(root.attributes('title')).toBe('Query builder');
  });

  it('custom accessibleDescriptionGenerator is used', () => {
    const wrapper = mountQueryBuilder({
      accessibleDescriptionGenerator: ({ path }) =>
        path.length === 0 ? 'Root' : `Nested at ${path.join(',')}`,
      defaultQuery: createRuleGroup({ rules: [] }),
    });
    const root = wrapper.find(`[data-testid="${TestID.ruleGroup}"]`);
    expect(root.attributes('title')).toBe('Root');
  });

  it('nested RuleGroup has title for path', async () => {
    const wrapper = mountQueryBuilder({
      accessibleDescriptionGenerator: generateAccessibleDescription,
      defaultQuery: createRuleGroup({
        rules: [
          createRuleGroup({
            id: 'nested-1',
            rules: [createRule()],
          }),
        ],
      }),
    });
    const groups = wrapper.findAll(`[data-testid="${TestID.ruleGroup}"]`);
    expect(groups.length).toBeGreaterThanOrEqual(2);
    // Root is first (path [])
    expect(groups[0].attributes('title')).toBe('Query builder');
    // Nested group (path [0]) should have "Rule group at path 0"
    const nested = groups.find((g) => g.attributes('title') === 'Rule group at path 0');
    expect(nested).toBeDefined();
    expect(nested!.attributes('title')).toBe('Rule group at path 0');
  });
});
