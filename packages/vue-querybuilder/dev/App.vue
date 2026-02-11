<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { RuleGroupType, RuleGroupTypeAny, RuleType } from '@react-querybuilder/core';
import { defaultValidator, generateAccessibleDescription, isRuleGroup } from '@react-querybuilder/core';
import type { QueryValidator } from '@react-querybuilder/core';
import { QueryBuilder } from '../src';
import { fields, initialQuery } from './demoData';
import { defaultOptions, optionOrder, optionLabels } from './demoOptions';

/** 与 React demo 一致：group 用 defaultValidator，rule 按“空 value 为 invalid”写 result[rule.id]，并递归校验子 query（如 Tour stops）*/
const demoValidator: QueryValidator = (query: RuleGroupTypeAny) => {
  const result = defaultValidator(query) as Record<string, boolean | { valid: boolean; reasons?: unknown[] }>;
  const walk = (rg: RuleGroupTypeAny) => {
    for (const r of rg.rules) {
      if (typeof r === 'string') continue;
      if (isRuleGroup(r)) walk(r);
      else if (r.id) {
        const v = (r as RuleType).value;
        if (isRuleGroup(v)) {
          Object.assign(result, defaultValidator(v));
          walk(v);
          result[r.id] = true;
        } else {
          const empty = v === '' || v === undefined || v === null || (Array.isArray(v) && v.length === 0);
          result[r.id] = !empty;
        }
      }
    }
  };
  walk(query);
  return result;
};

const query = ref<RuleGroupType>(initialQuery);

const options = reactive({ ...defaultOptions });

const queryBuilderProps = computed(() => ({
  fields: fields as any,
  accessibleDescriptionGenerator: generateAccessibleDescription,
  validator: options.validateQuery ? demoValidator : undefined,
  showCombinatorsBetweenRules: options.showCombinatorsBetweenRules,
  showNotToggle: options.showNotToggle,
  showCloneButtons: options.showCloneButtons,
  showLockButtons: options.showLockButtons,
  showMuteButtons: options.showMuteButtons,
  showShiftActions: options.showShiftActions,
  resetOnFieldChange: options.resetOnFieldChange,
  resetOnOperatorChange: options.resetOnOperatorChange,
  autoSelectField: options.autoSelectField,
  autoSelectOperator: options.autoSelectOperator,
  autoSelectValue: options.autoSelectValue,
  addRuleToNewGroups: options.addRuleToNewGroups,
  validateQuery: options.validateQuery,
  independentCombinators: options.independentCombinators,
  listsAsArrays: options.listsAsArrays,
  enableDragAndDrop: options.enableDragAndDrop,
  disabled: options.disabled,
  parseNumbers: options.parseNumbers,
  suppressStandardClassnames: options.suppressStandardClassnames,
  controlClassnames: {
    queryBuilder: [
      options.justifiedLayout && 'queryBuilder-justified',
      options.showBranches && 'queryBuilder-branches',
    ].filter(Boolean).join(' ') || undefined,
  },
}));

function selectAll() {
  optionOrder.forEach(key => {
    (options as Record<string, boolean>)[key] = true;
  });
}

function resetToDefaults() {
  optionOrder.forEach(key => {
    (options as Record<string, boolean>)[key] = defaultOptions[key];
  });
}
</script>

<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>Vue QueryBuilder Demo</h1>
      <p class="demo-desc">
        测试数据与 <a href="https://react-querybuilder.js.org/demo" target="_blank" rel="noopener">React Query Builder Demo</a> 一致
      </p>
    </header>

    <div class="demo-body">
      <aside class="options-panel">
        <h2 class="options-title">Options</h2>
        <div class="options-grid">
          <label v-for="key in optionOrder" :key="key" class="option-item" :title="optionLabels[key]">
            <input type="checkbox" v-model="(options as any)[key]" />
            <span>{{ optionLabels[key] }}</span>
          </label>
        </div>
        <div class="options-actions">
          <button type="button" @click="selectAll">Select all</button>
          <button type="button" @click="resetToDefaults">Reset to defaults</button>
        </div>
      </aside>

      <main class="demo-main" :class="{ validateQuery: options.validateQuery }">
        <QueryBuilder v-model="query" v-bind="queryBuilderProps" />
      </main>

      <aside class="query-display">
        <h2>Query</h2>
        <pre>{{ JSON.stringify(query, null, 2) }}</pre>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.demo-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  background: #fff;
}

.demo-header h1 {
  margin: 0 0 4px;
  font-size: 1.35em;
}

.demo-desc {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.demo-desc a {
  color: #25c2a0;
}

.demo-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.options-panel {
  width: 280px;
  flex-shrink: 0;
  padding: 16px;
  background: #f9f9f9;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.options-title {
  margin: 0 0 12px;
  font-size: 1.1em;
  color: #2387c4;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
}

.option-item:hover {
  background: #f0f0f0;
}

.option-item span {
  font-size: 13px;
}

.options-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.options-actions button {
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
}

.options-actions button:hover {
  background: #f0f0f0;
}

.demo-main {
  flex: 1;
  min-width: 0;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid #eee;
}

.query-display {
  width: 320px;
  flex-shrink: 0;
  min-height: 0;
  padding: 16px;
  background: #f5f5f5;
  border-left: 1px solid #eee;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.query-display h2 {
  margin: 0 0 8px;
  font-size: 1em;
  flex-shrink: 0;
}

.query-display pre {
  margin: 0;
  flex: 1;
  min-height: 0;
  background: white;
  padding: 12px;
  border-radius: 4px;
  overflow-y: auto;
  overflow-x: auto;
  font-size: 12px;
}

/* 与 React demo 一致：开启验证时，无效 rule 的 .rule-value 高亮 */
.validateQuery :deep(.queryBuilder .rule.queryBuilder-invalid .rule-value) {
  background-color: rgba(102, 51, 153, 0.4);
}
.validateQuery :deep(.queryBuilder .rule.queryBuilder-invalid .rule-value::placeholder) {
  color: rgba(102, 51, 153, 0.5);
}
</style>
