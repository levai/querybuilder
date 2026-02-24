import type { FullField } from '@react-querybuilder/core';
import ActionElement from './components/ActionElement.vue';
import DragHandle from './components/DragHandle.vue';
import InlineCombinator from './components/InlineCombinator.vue';
import MatchModeEditor from './components/MatchModeEditor.vue';
import NotToggle from './components/NotToggle.vue';
import Rule from './components/Rule.vue';
import RuleGroup from './components/RuleGroup.vue';
import RuleGroupBodyComponents from './components/RuleGroupBodyComponents.vue';
import RuleGroupHeaderComponents from './components/RuleGroupHeaderComponents.vue';
import ShiftActions from './components/ShiftActions.vue';
import ValueEditor from './components/ValueEditor.vue';
import ValueSelector from './components/ValueSelector.vue';
import type { Controls } from './types';

/**
 * Default control elements for QueryBuilder.
 * @group Defaults
 */
export const defaultControlElements: Controls<FullField, string> = {
  actionElement: ActionElement as Controls<FullField, string>['actionElement'],
  addGroupAction: ActionElement as Controls<FullField, string>['addGroupAction'],
  addRuleAction: ActionElement as Controls<FullField, string>['addRuleAction'],
  cloneGroupAction: ActionElement as Controls<FullField, string>['cloneGroupAction'],
  cloneRuleAction: ActionElement as Controls<FullField, string>['cloneRuleAction'],
  combinatorSelector: ValueSelector as Controls<FullField, string>['combinatorSelector'],
  dragHandle: DragHandle,
  fieldSelector: ValueSelector as Controls<FullField, string>['fieldSelector'],
  inlineCombinator: InlineCombinator,
  lockGroupAction: ActionElement as Controls<FullField, string>['lockGroupAction'],
  lockRuleAction: ActionElement as Controls<FullField, string>['lockRuleAction'],
  matchModeEditor: MatchModeEditor,
  muteGroupAction: ActionElement as Controls<FullField, string>['muteGroupAction'],
  muteRuleAction: ActionElement as Controls<FullField, string>['muteRuleAction'],
  notToggle: NotToggle,
  operatorSelector: ValueSelector as Controls<FullField, string>['operatorSelector'],
  removeGroupAction: ActionElement as Controls<FullField, string>['removeGroupAction'],
  removeRuleAction: ActionElement as Controls<FullField, string>['removeRuleAction'],
  rule: Rule as Controls<FullField, string>['rule'],
  ruleGroup: RuleGroup as Controls<FullField, string>['ruleGroup'],
  ruleGroupBodyElements: RuleGroupBodyComponents as Controls<FullField, string>['ruleGroupBodyElements'],
  ruleGroupHeaderElements: RuleGroupHeaderComponents as Controls<FullField, string>['ruleGroupHeaderElements'],
  shiftActions: ShiftActions,
  valueEditor: ValueEditor,
  valueSelector: ValueSelector,
  valueSourceSelector: ValueSelector as Controls<FullField, string>['valueSourceSelector'],
};
