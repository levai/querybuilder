import { describe, it, expect } from 'vitest';
import { TestID } from '@react-querybuilder/core';
import { mountQueryBuilder, createRule, createRuleGroup } from '../testUtils';

const matchModeField = {
  name: 'tags',
  label: 'Tags',
  getMatchModes: () => [
    { name: 'all', label: 'All' },
    { name: 'any', label: 'Any' },
  ],
};

describe('QueryBuilder match mode and subQuery', () => {
  it('shows MatchModeEditor when field has getMatchModes', () => {
    const wrapper = mountQueryBuilder({
      fields: [
        { name: 'field1', label: 'Field 1' },
        matchModeField,
      ],
      defaultQuery: createRuleGroup({
        rules: [
          createRule({
            field: 'tags',
            operator: '=',
            value: createRuleGroup({ id: 'sub-1', rules: [] }),
          }),
        ],
      }),
    });
    const matchModeEditor = wrapper.find(`[data-testid="${TestID.matchModeEditor}"]`);
    expect(matchModeEditor.exists()).toBe(true);
  });

  it('renders SubQuery (nested RuleGroup) when rule has match modes and value is RuleGroup', () => {
    const wrapper = mountQueryBuilder({
      fields: [
        { name: 'field1', label: 'Field 1' },
        matchModeField,
      ],
      defaultQuery: createRuleGroup({
        rules: [
          createRule({
            field: 'tags',
            operator: '=',
            value: createRuleGroup({ id: 'sub-1', combinator: 'and', rules: [], not: false }),
          }),
        ],
      }),
    });
    const subQuery = wrapper.find('.queryBuilder-subQuery');
    expect(subQuery.exists()).toBe(true);
    // Nested RuleGroup should be inside subQuery (add rule button or rule group body)
    const nestedGroups = subQuery.findAll(`[data-testid="${TestID.ruleGroup}"]`);
    expect(nestedGroups.length).toBeGreaterThanOrEqual(1);
  });

  it('subQuery has add rule button', () => {
    const wrapper = mountQueryBuilder({
      fields: [
        { name: 'field1', label: 'Field 1' },
        matchModeField,
      ],
      defaultQuery: createRuleGroup({
        rules: [
          createRule({
            field: 'tags',
            operator: '=',
            value: createRuleGroup({ id: 'sub-1', combinator: 'and', rules: [], not: false }),
          }),
        ],
      }),
    });
    const subQuery = wrapper.find('.queryBuilder-subQuery');
    const addRuleBtn = subQuery.find(`[data-testid="${TestID.addRule}"]`);
    expect(addRuleBtn.exists()).toBe(true);
  });
});
