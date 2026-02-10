import type { FullField } from '@react-querybuilder/core';
import ActionElement from './components/ActionElement.vue';
import DragHandle from './components/DragHandle.vue';
import InlineCombinator from './components/InlineCombinator.vue';
import MatchModeEditor from './components/MatchModeEditor.vue';
import NotToggle from './components/NotToggle.vue';
import Rule from './components/Rule.vue';
import RuleGroup from './components/RuleGroup.vue';
import ShiftActions from './components/ShiftActions.vue';
import ValueEditor from './components/ValueEditor.vue';
import ValueSelector from './components/ValueSelector.vue';
import type { Controls } from './types';

/**
 * Default components used by {@link QueryBuilder}.
 *
 * @group Defaults
 */
export const defaultControlElements: {
  actionElement: typeof ActionElement;
  addGroupAction: typeof ActionElement;
  addRuleAction: typeof ActionElement;
  cloneGroupAction: typeof ActionElement;
  cloneRuleAction: typeof ActionElement;
  combinatorSelector: typeof ValueSelector;
  dragHandle: typeof DragHandle;
  fieldSelector: typeof ValueSelector;
  inlineCombinator: typeof InlineCombinator;
  lockGroupAction: typeof ActionElement;
  lockRuleAction: typeof ActionElement;
  matchModeEditor: typeof MatchModeEditor;
  muteGroupAction: typeof ActionElement;
  muteRuleAction: typeof ActionElement;
  notToggle: typeof NotToggle;
  operatorSelector: typeof ValueSelector;
  removeGroupAction: typeof ActionElement;
  removeRuleAction: typeof ActionElement;
  rule: typeof Rule;
  ruleGroup: typeof RuleGroup;
  ruleGroupBodyElements: typeof RuleGroup;
  ruleGroupHeaderElements: typeof RuleGroup;
  shiftActions: typeof ShiftActions;
  valueEditor: typeof ValueEditor;
  valueSelector: typeof ValueSelector;
  valueSourceSelector: typeof ValueSelector;
} = {
  actionElement: ActionElement,
  addGroupAction: ActionElement,
  addRuleAction: ActionElement,
  cloneGroupAction: ActionElement,
  cloneRuleAction: ActionElement,
  combinatorSelector: ValueSelector,
  dragHandle: DragHandle,
  fieldSelector: ValueSelector,
  inlineCombinator: InlineCombinator,
  lockGroupAction: ActionElement,
  lockRuleAction: ActionElement,
  matchModeEditor: MatchModeEditor,
  muteGroupAction: ActionElement,
  muteRuleAction: ActionElement,
  notToggle: NotToggle,
  operatorSelector: ValueSelector,
  removeGroupAction: ActionElement,
  removeRuleAction: ActionElement,
  rule: Rule,
  ruleGroup: RuleGroup,
  ruleGroupBodyElements: RuleGroup,
  ruleGroupHeaderElements: RuleGroup,
  shiftActions: ShiftActions,
  valueEditor: ValueEditor,
  valueSelector: ValueSelector,
  valueSourceSelector: ValueSelector,
} satisfies Controls<FullField, string>;
