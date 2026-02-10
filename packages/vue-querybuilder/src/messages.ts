/**
 * 与 React 版本对齐的警告/错误文案（仅开发环境使用）
 */
export const messages = {
  errorInvalidIndependentCombinatorsProp:
    'QueryBuilder was rendered with a truthy independentCombinators prop. This prop is deprecated and unnecessary. Furthermore, the initial query/defaultQuery prop was of type RuleGroupType instead of type RuleGroupIC. More info: https://react-querybuilder.js.org/docs/components/querybuilder#independent-combinators',

  errorUnnecessaryIndependentCombinatorsProp:
    'QueryBuilder was rendered with the deprecated and unnecessary independentCombinators prop. To use independent combinators, make sure the query/defaultQuery prop is of type RuleGroupIC when the component mounts. More info: https://react-querybuilder.js.org/docs/components/querybuilder#independent-combinators',

  errorDeprecatedRuleGroupProps:
    'A custom RuleGroup component has rendered a standard RuleGroup component with deprecated props. The combinator, not, and rules props should not be used. Instead, the full group object should be passed as the ruleGroup prop.',

  errorDeprecatedRuleProps:
    'A custom RuleGroup component has rendered a standard Rule component with deprecated props. The field, operator, value, and valueSource props should not be used. Instead, the full rule object should be passed as the rule prop.',

  errorBothQueryDefaultQuery:
    'QueryBuilder was rendered with both modelValue and defaultQuery props. QueryBuilder must be either controlled or uncontrolled (specify either the modelValue prop, or the defaultQuery prop, but not both). Decide between using a controlled or uncontrolled query builder and remove one of these props.',

  errorControlledToUncontrolled:
    'QueryBuilder is changing from a controlled component to be uncontrolled. This is likely caused by the modelValue changing from defined to undefined, which should not happen. Decide between using a controlled or uncontrolled query builder for the lifetime of the component.',

  errorUncontrolledToControlled:
    'QueryBuilder is changing from an uncontrolled component to be controlled. This is likely caused by the modelValue changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled query builder for the lifetime of the component.',
} as const;
