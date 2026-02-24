import {
  defaultControlElements,
  type Controls,
  type FullField,
} from 'vue-querybuilder';
import ElActionElement from './ElActionElement.vue';
import ElDragHandle from './ElDragHandle.vue';
import ElInlineCombinator from './ElInlineCombinator.vue';
import ElMatchModeEditor from './ElMatchModeEditor.vue';
import ElNotToggle from './ElNotToggle.vue';
import ElShiftActions from './ElShiftActions.vue';
import ElValueEditor from './ElValueEditor.vue';
import ElValueSelector from './ElValueSelector.vue';

const ElAction = ElActionElement as Controls<FullField, string>['actionElement'];

export const elementPlusControlElements: Controls<FullField, string> = {
  ...defaultControlElements,
  actionElement: ElAction,
  addRuleAction: ElAction,
  addGroupAction: ElAction,
  cloneRuleAction: ElAction,
  cloneGroupAction: ElAction,
  lockRuleAction: ElAction,
  lockGroupAction: ElAction,
  muteRuleAction: ElAction,
  muteGroupAction: ElAction,
  removeRuleAction: ElAction,
  removeGroupAction: ElAction,
  combinatorSelector: ElValueSelector as Controls<FullField, string>['combinatorSelector'],
  fieldSelector: ElValueSelector as Controls<FullField, string>['fieldSelector'],
  operatorSelector: ElValueSelector as Controls<FullField, string>['operatorSelector'],
  valueSourceSelector: ElValueSelector as Controls<FullField, string>['valueSourceSelector'],
  valueSelector: ElValueSelector,
  inlineCombinator: ElInlineCombinator as Controls<FullField, string>['inlineCombinator'],
  notToggle: ElNotToggle,
  shiftActions: ElShiftActions,
  dragHandle: ElDragHandle,
  matchModeEditor: ElMatchModeEditor,
  valueEditor: ElValueEditor as Controls<FullField, string>['valueEditor'],
};
