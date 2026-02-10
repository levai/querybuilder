import type { DefineComponent } from 'vue';
import type { QueryBuilderProps } from './types';
import QueryBuilderRoot from './QueryBuilder.vue';

/** 根组件，用法与 react-querybuilder 对齐 */
export const QueryBuilder = QueryBuilderRoot as DefineComponent<QueryBuilderProps>;
// export { RuleGroup, Rule, ActionElement, ValueSelector, ValueEditor, NotToggle, DragHandle, ShiftActions, InlineCombinator };

export { queryBuilderDefaults } from './defaults';

export { usePathsMemo } from './composables/usePathsMemo';
export type { PathInfo } from './composables/usePathsMemo';
export { useRuleGroupDnD } from './composables/useRuleGroupDnD';
export { useRuleDnD } from './composables/useRuleDnD';
export { useInlineCombinatorDnD } from './composables/useInlineCombinatorDnD';

export {
  generateID,
  prepareRuleGroup,
  formatQuery,
  defaultOperators,
  queryBuilderFlagDefaults,
  standardClassnames,
  isRuleGroup,
  isRuleType,
  isRuleGroupType,
  isRuleGroupTypeIC,
  getValidationClassNames,
  defaultValidator,
  defaultPlaceholderFieldName,
  defaultPlaceholderOperatorName,
  defaultCombinators,
  groupInvalidReasons,
  convertToIC,
  convertFromIC,
  toFullOption,
  toFullOptionList,
} from '@react-querybuilder/core';

export type {
  QueryBuilderProps,
  QueryBuilderContextValue,
  QueryActions,
  Controls,
  ResolvedControls,
  QueryBuilderClassnames,
  FullField,
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleType,
  FullOperator,
  FullCombinator,
  ValueEditorType,
  InputType,
  MoveOptions,
} from './types';
export type {
  ValidationResult,
  ValidationMap,
  QueryValidator,
  RuleValidator,
  ValueSource,
  ValueSources,
  ValueSourceFlexibleOptions,
  ParseNumbersPropConfig,
  Field,
  OptionGroup,
  FullOption,
  MatchMode,
  MatchModeOptions,
} from '@react-querybuilder/core';
