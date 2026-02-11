# Vue QueryBuilder 重构指南：Vue 3 原生实现

本文档描述如何将当前「按 React 思路移植」的 vue-querybuilder 重构为**完全按 Vue 3 逻辑**实现的版本，便于维护、减少 props 透传、并消除响应式与数据源不一致问题。

---

## 一、现状与问题

### 1.1 当前数据流（偏 React）

- **根组件**：`useQueryBuilderSchema(props)` 返回 `rootGroup`、`schema`、`actions` 等，通过 **props** 传给根级 `RuleGroup`。
- **RuleGroup / Rule**：接收大量 props（`ruleGroup`/`rule`、`schema`、`actions`、`translations`、`path`、`disabled` 等），并构造 `propsWithSchema = computed(() => ({ ...props, schema: schema.value }))` 再传给 composable。
- **数据来源**：`ruleGroup`/`rule` 来自父组件 props，而 schema、actions 来自 inject。存在「部分来自 props、部分来自 inject」的双源，易导致视图与禁用/值不同步。

### 1.2 具体痛点

| 问题 | 表现 | 根因 |
|------|------|------|
| 值/禁用不更新 | 输入框或禁用状态不随规则/规则组更新 | 子组件对 `value`/`disabled` 等做了解构，丢失响应式；或数据多源不一致 |
| Props 爆炸 | RuleGroup/Rule 接口冗长 | 按 React 的「父传子」方式透传 schema、actions、translations |
| Composables 别扭 | useRuleGroup/useRule 接收「props + schema」 | 为模拟 React 的 props 注入，在 Vue 里用 computed 包一层再传入 |
| 心智负担 | 要区分「从 props 读还是从 inject 读」 | 没有约定单一数据源与清晰的 provide/inject 边界 |

---

## 二、目标架构（Vue 3 原生）

### 2.1 原则

1. **单一数据源**：整棵 query 只存在于根组件的一个 `ref`（或 `reactive`），子组件**不**通过 props 接收「当前 ruleGroup/rule 的拷贝」，而是通过 **inject + path** 从根数据计算得出。
2. **Provide/Inject 为主**：schema、dispatch、queryRef 由根 provide；RuleGroup/Rule 只 inject，不再从 props 接收这些。
3. **子组件 props 最小化**：RuleGroup 只收 `path`（及少量结构型 props，如可选 key）；Rule 同理。ruleGroup/rule 数据一律由 **computed(getByPath(queryRef, path))** 得到。
4. **Composables 只依赖 inject + path**：useRuleGroup(path)、useRule(path) 内部 inject queryRef、schema、dispatch，不再接收「带 schema 的 props」。
5. **与 core 兼容**：继续使用 `@react-querybuilder/core` 的 `add/remove/update/move` 等生成新 query，根组件做一次赋值（如 `queryRef.value = nextQuery`），不改变 core 的不可变语义。

### 2.2 目标数据流

```
QueryBuilder (根)
  ├─ queryRef (ref) ────────────── provide(QUERY_REF_KEY)
  ├─ dispatch(fn) ──────────────── provide(DISPATCH_KEY)
  ├─ schema (computed) ─────────── provide(SCHEMA_KEY)  [已有，可保留/合并]
  └─ RuleGroup path=[]
        ├─ inject(QUERY_REF, SCHEMA, DISPATCH)
        ├─ ruleGroup = computed(() => getByPath(queryRef.value, path))
        └─ Rule path=[0], Rule path=[1], RuleGroup path=[0,0] …
              └─ 同上：inject + path，rule/ruleGroup = computed(getByPath(...))
```

### 2.3 关键 Injection Keys（建议）

在 `src/context/queryBuilderContext.ts`（或新建 `injectionKeys.ts`）中统一定义：

| Key | 类型 | 提供者 | 消费者 | 说明 |
|-----|------|--------|--------|------|
| `QUERY_REF_KEY` | `InjectionKey<Ref<RuleGroupTypeAny>>` | QueryBuilder | RuleGroup, Rule | 根 query，只读 + 用于 getByPath |
| `DISPATCH_KEY` | `InjectionKey<(q: RuleGroupTypeAny) => void>` | QueryBuilder | RuleGroup, Rule | 更新 query 的唯一入口 |
| `SCHEMA_KEY` | 已有 | QueryBuilder | 所有需要 schema 的组件 | 可保留现有 key，或与 context 合并 |
| `QB_CONTEXT_KEY` | 现有 `QUERY_BUILDER_CONTEXT_KEY` | QueryBuilder | 需要 classnames/translations 等 | 保留，用于非「query 数据」的上下文 |

说明：若当前已通过一个 context 对象 provide 了 schema 等，可先增加 `QUERY_REF_KEY` 与 `DISPATCH_KEY`，再逐步把「从 props 传的 ruleGroup/rule」改为从 queryRef + path 计算。

---

## 三、分步实施计划

### 阶段 0：准备（不破坏现有行为）

- [ ] **0.1** 在 `src/context/queryBuilderContext.ts` 中新增：
  - `QUERY_REF_KEY`
  - `DISPATCH_KEY`
- [ ] **0.2** 在 QueryBuilder.vue 中，在现有 provide 基础上**增加**：
  - `provide(QUERY_REF_KEY, qb.rootGroup)`（注意：当前 rootGroup 是 computed，若需「可写」的 queryRef，可改为 provide 与 schema 内部一致的 queryRef；见阶段 1）
  - `provide(DISPATCH_KEY, qb.dispatchQuery)`（或封装一个 dispatch 函数，内部调 schema 的 dispatchQuery）
- [ ] **0.3** 确认现有功能不变：新增/删除规则与规则组、值的编辑与禁用仍正常。

**注意**：若当前 `rootGroup` 是只读 computed，可先 provide 该 computed 的「源」queryRef（在 useQueryBuilderSchema 里已有），以便子组件用 getByPath(queryRef.value, path) 计算当前节点。dispatch 即现有的 dispatchQuery。

---

### 阶段 1：根组件统一 query 与 dispatch

- [ ] **1.1** 在 `useQueryBuilderSchema` 的返回值中显式暴露（若尚未）：
  - `queryRef`：当前内部维护的 ref，用于 provide。
  - `dispatchQuery`：已存在，作为 dispatch 提供。
- [ ] **1.2** QueryBuilder.vue 中：
  - provide `queryRef`（来自 qb.queryRef 或等价物）。
  - provide `dispatch`（qb.dispatchQuery 或包装函数）。
- [ ] **1.3** 保持根级 RuleGroup 仍通过 props 接收 `rule-group`、`rules` 等（暂时不改 RuleGroup 实现），仅保证 inject 的 queryRef / dispatch 与现有逻辑一致。再次回归：新增/删除、值、禁用。

---

### 阶段 2：RuleGroup 改为 inject + path 取数据

- [ ] **2.1** 定义 `getByPath(query, path)`（或使用 core 的 `findPath`）：根据 path 从根 query 取当前 ruleGroup 或 rule。
- [ ] **2.2** RuleGroup.vue：
  - Props 收窄：保留 `path`，移除 `ruleGroup`、`rules`、`id`、`not`、`combinator` 等「可从 queryRef + path 推导」的 props（或先保留 props 作为 fallback，内部优先用 inject + path）。
  - inject `QUERY_REF_KEY`、`DISPATCH_KEY`、`SCHEMA_KEY`（或现有 context key）。
  - 新增 computed：`ruleGroup = computed(() => getByPath(queryRef.value, path))`（或 findPath）；若 path 为空则即根，即 `queryRef.value`。
  - 用 `ruleGroup` 替代原先的 `props.ruleGroup` 参与渲染与 useRuleGroup。
- [ ] **2.3** useRuleGroup：
  - 接口改为主要接收 `path`（及必要的「当前 ruleGroup」用于类型/默认值）；或保留接收「ruleGroup 的 ref/computed」以便与现有调用兼容。
  - 内部不再依赖「从父组件传进来的 ruleGroup props」，改为依赖 inject 的 queryRef + path 计算出的 ruleGroup。
- [ ] **2.4** QueryBuilder.vue 根级 RuleGroup：不再传 `:rule-group="rootGroup"`、`:rules="rootGroup.rules"` 等，只传 `:path="rootPath"`（及仍需要的如 translations 若未放入 inject）。
- [ ] **2.5** 回归：规则组折叠/展开、添加规则/规则组、删除、combinator 切换、not 切换、禁用/静音显示正确。

---

### 阶段 3：Rule 改为 inject + path 取数据

- [ ] **3.1** Rule.vue：
  - Props 收窄：保留 `path`，移除 `rule`（及可从 path 推导的字段）。
  - inject `QUERY_REF_KEY`、`DISPATCH_KEY`、`SCHEMA_KEY`。
  - 新增 computed：`rule = computed(() => getByPath(queryRef.value, path))`（此处是 rule 节点）。
  - 用 `rule` 替代原先的 `props.rule` / ruleData 参与渲染与 useRule。
- [ ] **3.2** useRule：
  - 接口改为主要接收 `path`（及可选的 rule 的 ref/computed）；内部用 inject 的 queryRef + path 得到 rule。
  - 移除对「带 schema 的 props」的依赖，schema 一律 inject。
- [ ] **3.3** RuleGroup.vue 中渲染 Rule 时：只传 `:path="rulePath"`（由当前 ruleGroup.rules 与索引组成），不再传 `:rule="..."`。
- [ ] **3.4** 回归：单条规则的字段/操作符/值编辑、删除、克隆、锁定、静音、上移下移、校验样式正确；值与禁用状态与 query 一致。

---

### 阶段 4：Composables 收口为 inject + path

- [ ] **4.1** useRuleGroup：
  - 签名收敛为 `useRuleGroup(options: { path: Path })` 或保留少量可选参数（如 override disabled）。
  - 内部 `inject(QUERY_REF_KEY)`、`inject(DISPATCH_KEY)`、`inject(SCHEMA_KEY)`；`ruleGroup = computed(() => findPath(path, queryRef.value))`；其余逻辑基于 ruleGroup 与 schema 计算。
  - 删除对 `UseRuleGroupProps` 中 schema、ruleGroup 等「从 props 传入」的依赖。
- [ ] **4.2** useRule：
  - 同理收敛为 `useRule(options: { path: Path })`，内部 inject + path，rule = computed(() => findPath(path, queryRef.value))。
  - 删除 propsWithSchema 式调用。
- [ ] **4.3** 移除 RuleGroup.vue / Rule.vue 中的 `propsWithSchema`、以及不再需要的 props 定义与透传。
- [ ] **4.4** 类型与测试：更新类型定义、单测与 dev App，确保无遗漏引用旧 props。

---

### 阶段 5：清理与文档

- [ ] **5.1** 删除或废弃：不再使用的 context 字段、props 类型中的冗余字段、以及仅为「兼容旧 React 式传参」的代码。
- [ ] **5.2** 更新 README / 组件文档：说明「数据来自 inject + path，根组件只需提供 query + v-model + schema」。
- [ ] **5.3** 本 REFACTOR-VUE3.md：在每阶段完成后勾选，并补充「实际改动文件清单」与注意事项，便于后续维护。

---

## 四、代码约定（实施时遵守）

1. **禁止在子组件中解构会随 query 变化的 props**（如 value、disabled、rule、ruleGroup）。一律用 `props.xxx` 或 `computed(() => props.xxx)` / inject 得到的数据。
2. **getByPath / findPath**：与 core 的 `findPath` 对齐，path 为从根到当前节点的索引数组；根为 `[]`。
3. **类型**：RuleGroupTypeAny、RuleType、Path 等继续从 `@react-querybuilder/core` 和本地 types 引入；inject 的 key 使用 `InjectionKey<T>` 保证类型安全。
4. **向后兼容**：若需保留「仍通过 props 传 ruleGroup/rule」的旧用法，可在阶段 2/3 用「inject 优先、props fallback」过渡，再在阶段 5 移除 fallback。

---

## 五、验收与回滚

- **验收**：每个阶段后跑现有 dev App，手动验证：新增/删除规则与规则组、编辑规则值、切换字段/操作符、禁用/锁定/静音、combinator/not、校验样式；无控制台报错，无「值或禁用不更新」现象。
- **回滚**：每阶段可在单独分支或提交中完成，便于按阶段回滚；阶段 0/1 尽量不破坏现有行为，便于先合并再继续 2–5。

---

## 六、实际改动文件清单（实施时按阶段勾选）

| 阶段 | 文件 | 改动概要 |
|------|------|----------|
| 0 | `src/context/queryBuilderContext.ts` | 新增 QUERY_REF_KEY、DISPATCH_KEY |
| 0 | `src/components/QueryBuilder.vue` | provide queryRef、dispatch |
| 1 | `src/composables/useQueryBuilderSchema.ts` | 暴露 queryRef（若未暴露） |
| 1 | `src/components/QueryBuilder.vue` | provide 与 rootGroup 同源的 queryRef |
| 2 | `src/components/RuleGroup.vue` | inject + path，computed(ruleGroup)，收窄 props |
| 2 | `src/composables/useRuleGroup.ts` | 依赖 inject，可选 path 入参 |
| 2 | `src/components/QueryBuilder.vue` | 根 RuleGroup 只传 path（及必要项） |
| 3 | `src/components/Rule.vue` | inject + path，computed(rule)，收窄 props |
| 3 | `src/composables/useRule.ts` | 依赖 inject，path 入参 |
| 3 | `src/components/RuleGroup.vue` | 渲染 Rule 时只传 path |
| 4 | `src/composables/useRuleGroup.ts` | 签名与实现收口为 inject + path |
| 4 | `src/composables/useRule.ts` | 同上 |
| 4 | `src/components/RuleGroup.vue` | 移除 propsWithSchema 等 |
| 4 | `src/components/Rule.vue` | 同上 |
| 5 | 类型/README/本文档 | 清理与文档更新 |

---

*文档版本：1.0；可与实现同步更新。*
