# Element Plus 包装包设计（参考 @react-querybuilder/antd）

## 1. 包与依赖

- **包名**：`@vue-querybuilder/element-plus`
- **位置**：`packages/element-plus/`（与 `packages/antd`、`packages/vue-querybuilder` 平级）
- **依赖**：
  - `vue-querybuilder`（workspace）
  - `element-plus`（peer）
  - `vue`（peer）
  - 可选：`@element-plus/icons-vue`（peerOptional，按钮/拖拽手柄图标：Plus、Lock/Unlock、Mute/Bell、Delete、Top/Bottom、Rank）

## 2. 整体思路（与 antd 对齐）

- 不替换 **RuleGroup / Rule / InlineCombinator** 等布局与结构，只替换「控件」：按钮、选择器、输入框、Not、Shift、拖拽手柄等。
- 导出 **controlElements** 对象，键与 vue-querybuilder 的 `Controls` 一致，值为用 Element Plus 实现的 Vue 组件。
- 可选导出 **translations**（如用 Element Plus 图标替代文字）。
- 使用方式：把上述 `controlElements`（和可选的 `translations`）传给根组件 `QueryBuilder` 的 `control-elements` / `translations`。

## 3. 需要实现的控件与 Element Plus 对应

| 控件 key | 默认实现（vue-querybuilder） | Element Plus 对应组件 | 说明 |
|----------|------------------------------|------------------------|------|
| actionElement / addRuleAction / addGroupAction / clone* / lock* / mute* / remove* | ActionElement.vue（button） | `ElButton` + 图标 | 图标按 testId/状态：Plus、FolderAdd、CopyDocument、Lock⇄Unlock、Mute⇄Bell、Delete；删除为 type="danger"；支持 `locked`/`muted` 显式传参以保证切换时图标更新 |
| valueSelector / … | ValueSelector.vue | `ElSelect` + `ElOption`（ElValueSelector） | 单选/多选、options 转 ElOption |
| valueEditor | ValueEditor.vue | `ElInput` / `ElInputNumber` / `ElSelect` / `ElDatePicker` / `ElCheckbox` 等（ElValueEditor） | 按 type/inputType/operator 分支；between/notBetween 双输入使用 `.value-editor-between` 横向一排，主题中防压缩 |
| notToggle | NotToggle.vue | `ElSwitch`（ElNotToggle） | — |
| shiftActions | ShiftActions.vue | `ElButtonGroup` + Top/Bottom 图标（ElShiftActions） | — |
| dragHandle | DragHandle.vue | `ElIcon` + Rank 图标（ElDragHandle） | 保持 draggable 等 DnD 行为 |
| inlineCombinator | InlineCombinator.vue | ElValueSelector（ElInlineCombinator） | 中间 combinator 下拉 |
| matchModeEditor | MatchModeEditor.vue | `ElSelect`（ElMatchModeEditor） | 已实现；QueryBuilderElementPlus 合并 control-elements 时不合入 undefined，避免覆盖 |

**RuleGroup / RuleGroupHeaderElements / RuleGroupBodyElements / Rule**：不替换，继续用 vue-querybuilder 默认。**SubQueryHeader**（根组 header）已改为从 `schema.controls` 读取控件，与 RuleGroupHeaderComponents 一致，使用 QueryBuilderElementPlus 时根 header 也会用 EP 控件。

## 4. 目录与文件结构建议

```
packages/element-plus/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # 导出 controlElements、translations、可选 QueryBuilderElementPlus
│   ├── elementPlusControlElements.ts  # 汇总所有控件（或直接写在 index）
│   ├── ElActionElement.vue         # ElButton 包装
│   ├── ElValueSelector.vue         # ElSelect 包装
│   ├── ElValueEditor.vue           # ElInput / ElInputNumber / ElSelect / ElDatePicker 等
│   ├── ElNotToggle.vue             # ElSwitch
│   ├── ElShiftActions.vue         # ElButton × 2
│   ├── ElDragHandle.vue            # ElIcon + 拖拽
│   ├── ElInlineCombinator.vue      # 可选，或复用 ElValueSelector
│   └── ElMatchModeEditor.vue       # 可选
├── README.md
└── (可选) elementPlusTranslations.ts  # 图标/文案
```

- 每个 Vue 组件 **props 与 vue-querybuilder 默认控件一致**（如 `handleOnClick`、`handleOnChange`、`className`、`disabled`、`title`、`testId` 等），内部用 Element Plus 组件渲染并转发事件。
- 与 antd 一样，把「不应传给 UI 库」的 props（如 `testID`、`rule`、`path`、`schema`）在解构时去掉，用 `...extraProps` 把其余透传给 Element Plus 组件。

## 5. 类型与导出

- **ControlElementsProp**：从 `vue-querybuilder` 或 `@react-querybuilder/core` 取类型，保证 `elementPlusControlElements` 满足 `ControlElementsProp<FullField, string>`（或 vue-querybuilder 导出的 `Controls`）。
- 导出建议：
  - `elementPlusControlElements`：完整控件表，可直接作为 `control-elements` 传入 QueryBuilder。
  - `elementPlusTranslations`：可选，用于图标/文案（若用 `@element-plus/icons-vue`，这里导出 `Partial<Translations>`）。
  - `QueryBuilderElementPlus`（可选）：对 `QueryBuilder` 的包装组件，默认把 `elementPlusControlElements` 和 `elementPlusTranslations` 注入，其余 props 透传；这样用户只需 `<QueryBuilderElementPlus ... />` 即可用 Element Plus 主题。

## 6. 使用方式示例

```vue
<!-- 方式一：只传 controlElements -->
<QueryBuilder
  v-model="query"
  :fields="fields"
  :control-elements="elementPlusControlElements"
/>

<!-- 方式二：controlElements + translations -->
<QueryBuilder
  v-model="query"
  :fields="fields"
  :control-elements="elementPlusControlElements"
  :translations="elementPlusTranslations"
/>

<!-- 方式三（若提供包装组件）：默认即 Element Plus 主题 -->
<QueryBuilderElementPlus
  v-model="query"
  :fields="fields"
/>
```

## 7. 构建与发布

- 构建：与 vue-querybuilder 类似，用 Vue 3 + TypeScript 的构建（如 tsdown / Vite），产出 ESM + CJS，并生成类型。
- 样式：Element Plus 由使用方按官方方式全局或按需引入；本包不强制打包 element-plus 的 CSS，在 README 中说明需用户自行引入 Element Plus 样式即可。
- 在 monorepo 的 `package.json` workspaces 中把 `element-plus` 加入；发布时与 vue-querybuilder 同流水线或单独发均可。

## 8. 与 antd 的差异小结

| 项目 | @react-querybuilder/antd | @vue-querybuilder/element-plus（本设计） |
|------|---------------------------|----------------------------------------|
| 底层 | react-querybuilder | vue-querybuilder |
| 控件形态 | React 组件 | Vue 3 组件（.vue 或 h） |
| 上下文 | getCompatContextProvider 注入 controlElements/translations | 通过 QueryBuilder 的 props 传入 control-elements / translations |
| 布局/规则组 | 不替换 | 不替换，只换上述控件表 |
| 样式 | antd 由使用方引入 | Element Plus 由使用方引入 |

按上述设计即可得到与 antd 包同构的「仅换 UI 库」的 Element Plus 包装，功能与 vue-querybuilder 默认一致，仅视觉与交互使用 Element Plus。

---

## 9. Element Plus CSS 变量主题（已实现）

为让 QueryBuilder 的「壳」（ruleGroup、rule、header、body、边框、DnD 指示器）也跟随 Element Plus 风格，本包提供主题层：

- **原理**：core 的样式使用 `--rqb-*` 变量（见 `packages/core/src/styles/_root.scss`）。本包提供 `theme-element-plus.scss`，在作用域 `.vue-querybuilder-element-plus` 下将 Element Plus 的 `--el-*` 映射为 `--rqb-*`（如 `--rqb-border-color: var(--el-border-color)`、`--rqb-background-color: var(--el-fill-color-blank)`、`--rqb-border-radius: var(--el-border-radius-base)` 等）。
- **使用**：用户引入 Element Plus 样式后，再引入 `@vue-querybuilder/element-plus/theme.css`；使用 `<QueryBuilderElementPlus />` 时根节点自带 `vue-querybuilder-element-plus` 类，主题自动生效。若使用 `<QueryBuilder :control-elements="elementPlusControlElements" />`，需在包裹节点上加上该类名以应用主题。
- **实现位置**：`packages/element-plus/src/theme-element-plus.scss`，构建时输出为 `dist/theme-element-plus.css`，包导出为 `theme.css`。
- **额外样式**：`.value-editor-between` 为 between/notBetween 双输入容器，`inline-flex` 横向排列，子元素 `flex-shrink: 0`、`min-width: 11em` 防止被压缩。
