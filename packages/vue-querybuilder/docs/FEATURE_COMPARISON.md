# Vue QueryBuilder vs React QueryBuilder 功能全面对比

基于 `@react-querybuilder/core` 共享类型与逻辑，Vue 与 React 在 API 和功能上对齐。以下按模块逐项对比。

---

## 1. 顶层 API（QueryBuilder Props）

### 1.1 受控 / 非受控

| 能力 | React | Vue |
|------|--------|-----|
| 受控 | `query` + `onQueryChange` | `modelValue` / `query` + `@update:modelValue` / `onQueryChange` ✓ |
| 非受控 | `defaultQuery` | `defaultQuery` ✓ |

### 1.2 数据与默认值

| Prop | React | Vue |
|------|--------|-----|
| fields | ✓ | ✓ |
| operators | ✓ | ✓ |
| combinators | ✓ | ✓ |
| baseField / baseOperator / baseCombinator | ✓ | ✓ |
| getDefaultField | ✓ | ✓ |
| getDefaultOperator | ✓ | ✓ |
| getDefaultValue | ✓ | ✓ |

### 1.3 动态配置（get*）

| Prop | React | Vue |
|------|--------|-----|
| getOperators | ✓ | ✓ |
| getValueEditorType | ✓ | ✓ |
| getValueEditorSeparator | ✓（返回 ReactNode） | ✓（返回 string \| VNode \| null） |
| getValueSources | ✓ | ✓ |
| getInputType | ✓ | ✓ |
| getValues | ✓ | ✓ |
| getMatchModes | ✓ | ✓ |
| getSubQueryBuilderProps | ✓ | ✓ |
| getRuleClassname | ✓ | ✓ |
| getRuleGroupClassname | ✓ | ✓ |

### 1.4 生命周期回调（on*）

| Prop | React | Vue |
|------|--------|-----|
| onAddRule | ✓ | ✓ |
| onAddGroup | ✓ | ✓ |
| onMoveRule | ✓ | ✓ |
| onMoveGroup | ✓ | ✓ |
| onGroupRule | ✓ | ✓ |
| onGroupGroup | ✓ | ✓ |
| onRemove | ✓ | ✓ |
| onQueryChange | ✓ | ✓（与 onUpdateModelValue 均会触发） |
| onLog | ✓ | ✓（类型有，需配合 debugMode） |

### 1.5 Schema 开关（QueryBuilderFlags / 显示与行为）

| Prop | React | Vue |
|------|--------|-----|
| showNotToggle | ✓ | ✓ |
| showShiftActions | ✓ | ✓ |
| showCloneButtons | ✓ | ✓ |
| showLockButtons | ✓ | ✓ |
| showMuteButtons | ✓ | ✓ |
| showCombinatorsBetweenRules | ✓ | ✓ |
| independentCombinators | ✓ | ✓ |
| autoSelectField | ✓ | ✓ |
| autoSelectOperator | ✓ | ✓ |
| autoSelectValue | ✓ | ✓ |
| addRuleToNewGroups | ✓ | ✓ |
| resetOnFieldChange | ✓ | ✓ |
| resetOnOperatorChange | ✓ | ✓ |
| enableDragAndDrop | ✓ | ✓（原生 HTML5 DnD） |
| maxLevels | ✓ | ✓ |
| enableMountQueryChange | ✓ | ⚠ 类型继承自 core，Vue 内部未使用（子 Query 初始同步依赖 watch） |
| debugMode | ✓ | ✓（类型有；onLog 可用） |
| suppressStandardClassnames | ✓ | ✓ |
| listsAsArrays | ✓ | ✓ |
| parseNumbers | ✓ | ✓ |
| disabled | ✓（boolean \| Path[]） | ✓ |
| validator | ✓ | ✓ |
| validationMap | ✓（schema 内） | ✓ |
| idGenerator | ✓ | ✓ |
| accessibleDescriptionGenerator | ✓ | ✓ |
| context | ✓ | ✓ |
| controlClassnames | ✓ | ✓ |
| controlElements | ✓ | ✓ |
| translations | ✓ | ✓ |

### 1.6 拖拽专属（Vue 原生 DnD）

| Prop | React（@react-querybuilder/dnd） | Vue |
|------|----------------------------------|-----|
| canDrop | ✓ | ✓ |
| copyModeModifierKey | ✓ 默认 `'alt'` | ✓ 默认 `'alt'` |
| groupModeModifierKey | ✓ 默认 `'ctrl'` | ✓ 默认 `'ctrl'` |
| hideDefaultDragPreview | ✓ getEmptyImage | ✓ getEmptyImage + setDragImage |

---

## 2. 组件与控件（Controls）

### 2.1 默认控件列表

| 控件 | React | Vue |
|------|--------|-----|
| ruleGroup | RuleGroup | RuleGroup.vue ✓ |
| ruleGroupHeaderElements | RuleGroupHeaderComponents | RuleGroupHeaderComponents.vue ✓ |
| ruleGroupBodyElements | RuleGroupBodyComponents | RuleGroupBodyComponents.vue ✓ |
| rule | Rule | Rule.vue ✓ |
| fieldSelector | ValueSelector | ValueSelector.vue ✓ |
| operatorSelector | ValueSelector | ValueSelector.vue ✓ |
| valueSelector | ValueSelector | ValueSelector.vue ✓ |
| valueEditor | ValueEditor | ValueEditor.vue ✓ |
| valueSourceSelector | ValueSelector | ValueSelector.vue ✓ |
| combinatorSelector | ValueSelector | ValueSelector.vue ✓ |
| inlineCombinator | InlineCombinator | InlineCombinator.vue ✓ |
| notToggle | NotToggle | NotToggle.vue ✓ |
| shiftActions | ShiftActions | ShiftActions.vue ✓ |
| dragHandle | DragHandle | DragHandle.vue ✓ |
| matchModeEditor | MatchModeEditor | MatchModeEditor.vue ✓ |
| actionElement / addRuleAction / addGroupAction 等 | ActionElement | ActionElement.vue ✓ |

### 2.2 子查询（SubQuery / hasSubQuery）

| 项目 | React | Vue |
|------|--------|-----|
| 子 Query 容器 | Rule 内 RuleGroupHeaderControlElements + RuleGroupBodyControlElements，useQueryBuilder(enableDragAndDrop: false) | SubQueryWrapper + SubQueryHeader + SubQueryBody ✓ |
| 子 Query 数据 | getSubQueryBuilderProps + fields 等 | SubQueryWrapper schema（fields 等）+ enableDragAndDrop: false ✓ |
| 子 Query 不启用 DnD | useQueryBuilder(..., enableDragAndDrop: false) | schema.enableDragAndDrop: false ✓ |

---

## 3. 状态与 Core 调用

| 能力 | React | Vue |
|------|--------|-----|
| 状态来源 | useQueryBuilderSetup + useQueryBuilderSchema，Redux 或 useState | useQueryBuilderSchema，单 queryRef + provide ✓ |
| 更新方式 | dispatch / setState | dispatchQuery → queryRef + onUpdateModelValue / onQueryChange ✓ |
| add / remove / update / move / group | core 同款 | core 同款（add, remove, update, move, group） ✓ |
| pathsMemo（path + disabled） | ✓ | ✓ |
| independentCombinators 检测与 IC 转换 | ✓ | ✓（watch 同步 query 格式） ✓ |
| getQuery 返回原始值 | ✓ | ✓（toRaw + structuredClone） |

---

## 4. 验证（Validation）

| 能力 | React | Vue |
|------|--------|-----|
| validator | ✓ | ✓ |
| validationMap（schema） | ✓ | ✓ |
| validationResult 下传 Rule/RuleGroup | ✓ | ✓ |
| getValidationClassNames | ✓ | ✓（core） |
| 禁用路径 disabledPaths | ✓ | ✓ |

---

## 5. 样式与无障碍

| 能力 | React | Vue |
|------|--------|-----|
| classNames / controlClassnames | ✓ | ✓ |
| standardClassnames（core） | ✓ | ✓ |
| getRuleClassname / getRuleGroupClassname | ✓ | ✓ |
| accessibleDescriptionGenerator | ✓ | ✓ |
| 根 group title / 描述 | ✓ | ✓ |

---

## 6. 拖拽（DnD）——详见 DND_COMPARISON.md

| 能力 | React（dnd 包） | Vue（原生） |
|------|------------------|-------------|
| 放置目标 | Rule、RuleGroup（header）、InlineCombinator | 一致 ✓ |
| 拖拽源 | Rule、RuleGroup（非根） | 一致 ✓ |
| 根组 | 仅 drop，无 drag 手柄 | 一致（enableDropTargetsVal / showGroupDragHandleVal） ✓ |
| destinationPath / canDrop / 修饰键 | ✓ | 一致 ✓ |
| 子 Query 内无 DnD | enableDragAndDrop: false | schema.enableDragAndDrop: false ✓ |

---

## 7. 差异与注意事项

| 项目 | 说明 |
|------|------|
| **受控绑定** | Vue 用 `modelValue` + `update:modelValue`，React 用 `query` + `onQueryChange`；Vue 同时支持 `query` 别名。 |
| **getValueEditorSeparator** | React 为 ReactNode，Vue 为 string \| VNode \| null。 |
| **enableMountQueryChange** | React 用于控制首次 mount 是否触发 onQueryChange；Vue 类型有，逻辑未单独实现（子 Query 初始值通过 watch 同步）。 |
| **DnD 实现** | React 依赖 react-dnd + backend；Vue 使用原生 HTML5 DnD，无额外库。 |
| **RuleGroup 结构** | React 与 Vue 一致：RuleGroup 为壳，渲染 RuleGroupHeaderElements + RuleGroupBodyElements；默认控件为 RuleGroupHeaderComponents / RuleGroupBodyComponents，可通过 controlElements 分别覆盖。 |

---

## 8. 小结

- **Props / Schema / 回调 / 控件**：与 React 对齐，Vue 支持 QueryBuilderProps 及 core 的 QueryBuilderFlags、Schema、Controls。
- **状态与 core**：单 queryRef + dispatchQuery，与 core 的 add/remove/update/move/group 一致。
- **验证、样式、无障碍**：与 React 一致。
- **拖拽**：行为 1:1，实现为原生 DnD；子 Query 内均关闭 DnD。
- **已知差异**：`enableMountQueryChange` 在 Vue 中未单独实现；`getValueEditorSeparator` 类型为 string | VNode。
