# vue-querybuilder

Vue 3 Query Builder component — 1:1 port of [react-querybuilder](https://github.com/react-querybuilder/react-querybuilder) using `@react-querybuilder/core` (mutable API).

## Installation

```bash
bun add vue-querybuilder @react-querybuilder/core
# or
npm i vue-querybuilder @react-querybuilder/core
```

**Peer dependency:** Vue 3.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { QueryBuilder } from 'vue-querybuilder';
import type { RuleGroupType } from '@react-querybuilder/core';

const query = ref<RuleGroupType>({
  combinator: 'and',
  rules: [{ field: 'name', operator: '=', value: '' }],
});

const fields = [
  { name: 'name', label: 'Name', value: 'name' },
  { name: 'age', label: 'Age', value: 'age' },
];
</script>

<template>
  <QueryBuilder v-model="query" :fields="fields" />
</template>
```

## API

- **Props:** `modelValue` (controlled) or `defaultQuery` (uncontrolled), `fields`, `operators`, `combinators`, and all options from react-querybuilder (see [QueryBuilderProps](https://react-querybuilder.js.org/docs/api/querybuilderprops)).
- **Events:** `update:modelValue` when the query changes.

### API 对照（Vue vs React）

| React (props) | Vue (props / 事件) |
|---------------|---------------------|
| `query` | `modelValue`（受控） |
| `defaultQuery` | `defaultQuery`（非受控） |
| `onQueryChange` | `onUpdateModelValue` 或 `@update:modelValue` |
| 其余 props | 与 [QueryBuilderProps](https://react-querybuilder.js.org/docs/api/querybuilderprops) 一致 |

**主要 props 一览（与 React 逐项对应）：**

- **数据与回调**：`modelValue` / `defaultQuery` / `onUpdateModelValue`、`fields`、`operators`、`combinators`、`baseField` / `baseOperator` / `baseCombinator`
- **get* 系列**：`getDefaultField`、`getDefaultOperator`、`getDefaultValue`、`getOperators`、`getValueEditorType`、`getInputType`、`getValues`、`getValueSources`、`getMatchModes`、`getSubQueryBuilderProps`、`getRuleClassname`、`getRuleGroupClassname`、`getValueEditorSeparator`
- **on* 回调**：`onAddRule`、`onAddGroup`、`onRemove`、`onMoveRule`、`onMoveGroup`、`onGroupRule`、`onGroupGroup`
- **显示开关**：`showNotToggle`、`showShiftActions`、`showCloneButtons`、`showLockButtons`、`showMuteButtons`、`showCombinatorsBetweenRules`、`independentCombinators`
- **行为**：`disabled`、`autoSelectField`、`autoSelectOperator`、`autoSelectValue`、`resetOnFieldChange`、`resetOnOperatorChange`、`addRuleToNewGroups`、`enableDragAndDrop`、`maxLevels`、`enableMountQueryChange`
- **验证与数据**：`validator`、`parseNumbers`、`listsAsArrays`、`suppressStandardClassnames`
- **调试与扩展**：`debugMode`、`onLog`、`idGenerator`、`accessibleDescriptionGenerator`、`controlClassnames` / `controlElements`、`translations`、`context`

## Development

```bash
bun install
bun run build
bun run start   # dev server
```

## Status

- **Core:** QueryBuilder, RuleGroup, Rule; default controls (ValueSelector, ValueEditor, ActionElement, NotToggle, ShiftActions, InlineCombinator, MatchModeEditor, SubQueryWrapper).
- **Actions:** Add/remove/clone rules and groups; shift up/down; lock/mute; combinator and NOT; validation (validator + validationMap).
- **State:** Controlled (`modelValue` / `@update:modelValue`) or uncontrolled (`defaultQuery`); pathsMemo, useControlledOrUncontrolled, useDeprecatedProps.
- Uses `@react-querybuilder/core` mutable API (`addInPlace`, `updateInPlace`, `removeInPlace`, `moveInPlace`).
- **Drag-and-drop:** not implemented (placeholder); planned for a later release.
