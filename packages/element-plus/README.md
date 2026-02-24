# @vue-querybuilder/element-plus

Element Plus 控件与主题适配，用于 [vue-querybuilder](https://github.com/react-querybuilder/react-querybuilder/tree/main/packages/vue-querybuilder)。

## 安装

```bash
bun add vue-querybuilder element-plus @element-plus/icons-vue @vue-querybuilder/element-plus
# 或
npm i vue-querybuilder element-plus @element-plus/icons-vue @vue-querybuilder/element-plus
```

图标依赖 `@element-plus/icons-vue` 为可选（peerOptional），未安装时按钮仍显示文字。

## 使用

### 1. 引入样式

在应用入口引入 Element Plus 样式后，再引入本包主题（将 QueryBuilder 的 `--rqb-*` 映射为 Element Plus 的 `--el-*`，使组、规则、边框与 DnD 指示器风格一致）：

```ts
import 'element-plus/dist/index.css';
import '@vue-querybuilder/element-plus/theme.css';
```

### 2. 使用控件

**方式一：仅传入控件**

```vue
<template>
  <QueryBuilder
    v-model="query"
    :fields="fields"
    :control-elements="elementPlusControlElements"
  />
</template>

<script setup lang="ts">
import { QueryBuilder } from 'vue-querybuilder';
import { elementPlusControlElements } from '@vue-querybuilder/element-plus';
import 'element-plus/dist/index.css';
import '@vue-querybuilder/element-plus/theme.css';

const query = ref({ combinator: 'and', rules: [] });
const fields = [{ name: 'field1', label: 'Field 1' }];
</script>
```

**方式二：使用包装组件（自动带主题类名与控件）**

```vue
<template>
  <QueryBuilderElementPlus v-model="query" :fields="fields" />
</template>

<script setup lang="ts">
import { QueryBuilderElementPlus } from '@vue-querybuilder/element-plus';
import 'element-plus/dist/index.css';
import '@vue-querybuilder/element-plus/theme.css';

const query = ref({ combinator: 'and', rules: [] });
const fields = [{ name: 'field1', label: 'Field 1' }];
</script>
```

包装组件会在根节点加上 `vue-querybuilder-element-plus` 类，主题 CSS 会作用在该类下，使整体风格与 Element Plus 一致。

## 导出

- `elementPlusControlElements` — 控件表，可传给 `QueryBuilder` 的 `control-elements`
- `QueryBuilderElementPlus` — 带默认控件与主题类名的 `QueryBuilder` 包装组件；合并 `control-elements` 时仅合并非空值，避免用户传入 `undefined` 覆盖 EP 控件（如 matchModeEditor）
- `ElActionElement`、`ElValueSelector`、`ElNotToggle`、`ElShiftActions`、`ElDragHandle`、`ElMatchModeEditor`、`ElValueEditor`、`ElInlineCombinator` — 可单独覆盖的控件组件
- `theme.css` — 将 `--el-*` 映射到 `--rqb-*` 的主题样式，需在引入 Element Plus 样式后引入；含 `.value-editor-between` 双输入横向布局及防压缩样式

## 控件对应

| 控件           | Element Plus 实现 |
|----------------|-------------------|
| 按钮类 Action  | ElButton + 图标（Plus / Lock⇄Unlock / Mute⇄Bell / Delete 等），删除为 `type="danger"` |
| 各类 Selector  | ElSelect + ElOption（ElValueSelector） |
| Not 开关       | ElSwitch（ElNotToggle） |
| 上/下移        | ElButtonGroup + Top/Bottom 图标（ElShiftActions） |
| 拖拽手柄       | ElIcon + Rank 图标（ElDragHandle） |
| MatchMode      | ElSelect（ElMatchModeEditor） |
| ValueEditor    | ElInput / ElInputNumber / ElSelect / ElDatePicker / ElCheckbox 等（ElValueEditor）；between/notBetween 双输入横向一排 |
| InlineCombinator | ElValueSelector |
| RuleGroup/Rule | 使用 vue-querybuilder 默认（布局与 DnD 不变） |

根组 header（SubQueryHeader）与嵌套组 header（RuleGroupHeaderComponents）均从 `schema.controls` 读取控件，使用 `QueryBuilderElementPlus` 时根 header 也会使用上述 EP 控件。
