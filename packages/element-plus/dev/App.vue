<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { RuleGroupType, RuleGroupTypeAny, RuleType, ExportFormat, QueryValidator } from 'vue-querybuilder';
import {
  defaultValidator,
  generateAccessibleDescription,
  isRuleGroup,
  formatQuery,
} from 'vue-querybuilder';
import { QueryBuilderElementPlus } from '@vue-querybuilder/element-plus';
import { fields, initialQuery } from './demoData';
import { defaultOptions, optionOrder, optionLabels } from './demoOptions';

/** 与 vue-querybuilder dev 一致：group 用 defaultValidator，rule 空 value 为 invalid，递归子 query（如 Tour stops） */
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

const exportFormat = ref<ExportFormat>('json_without_ids');
const parseNumbersInExport = ref(false);

const exportFormats: Array<{ value: ExportFormat; label: string; group?: string }> = [
  { value: 'json', label: 'JSON', group: 'json' },
  { value: 'sql', label: 'SQL', group: 'sql' },
  { value: 'mongodb_query', label: 'MongoDB', group: 'mongodb' },
  { value: 'cel', label: 'CEL' },
  { value: 'spel', label: 'SpEL' },
  { value: 'jsonlogic', label: 'JsonLogic' },
  { value: 'elasticsearch', label: 'ElasticSearch' },
  { value: 'prisma', label: 'Prisma ORM' },
  { value: 'jsonata', label: 'JSONata' },
  { value: 'ldap', label: 'LDAP' },
  { value: 'natural_language', label: 'Natural language' },
];

const jsonSubFormats: Array<{ value: ExportFormat; label: string }> = [
  { value: 'json_without_ids', label: 'Without id or path' },
  { value: 'json', label: 'Full query object' },
];

const sqlSubFormats: Array<{ value: ExportFormat; label: string }> = [
  { value: 'sql', label: 'Inline' },
  { value: 'parameterized', label: 'Parameterized' },
  { value: 'parameterized_named', label: 'Named parameters' },
];

const objectFormats = new Set<ExportFormat>([
  'jsonlogic',
  'elasticsearch',
  'mongodb_query',
  'parameterized',
  'parameterized_named',
]);

const exportResult = computed(() => {
  try {
    const result = formatQuery(query.value, {
      format: exportFormat.value,
      parseNumbers: parseNumbersInExport.value || undefined,
      fields: fields as never,
    });
    if (objectFormats.has(exportFormat.value)) {
      return JSON.stringify(result, null, 2);
    }
    return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
});

const currentFormatGroup = computed(() => exportFormats.find(f => f.value === exportFormat.value)?.group);

/** 与 vue-querybuilder dev 一致：透传所有 options 到 QueryBuilder */
const queryBuilderProps = computed(() => ({
  fields: fields as never,
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
      <h1>Vue Query Builder (Element Plus) Dev</h1>
      <p class="demo-desc">与 vue-querybuilder dev 行为一致，仅控件为 Element Plus</p>
    </header>

    <div class="demo-body">
      <aside class="options-panel">
        <h2 class="options-title">Options</h2>
        <div class="options-grid">
          <label v-for="key in optionOrder" :key="key" class="option-item" :title="optionLabels[key]">
            <input type="checkbox" v-model="(options as Record<string, boolean>)[key]" />
            <span>{{ optionLabels[key] }}</span>
          </label>
        </div>
        <div class="options-actions">
          <button type="button" @click="selectAll">Select all</button>
          <button type="button" @click="resetToDefaults">Reset to defaults</button>
        </div>
      </aside>

      <main class="demo-main" :class="{ validateQuery: options.validateQuery }">
        <QueryBuilderElementPlus v-model="query" v-bind="queryBuilderProps" />
      </main>

      <aside class="query-display">
        <div class="tab-content">
          <h2>Query</h2>
          <pre class="query-preview">{{ JSON.stringify(query, null, 2) }}</pre>

          <div class="export-section">
            <h3>Export</h3>
            <div class="export-tabs">
              <button
                v-for="fmt in exportFormats"
                :key="fmt.value"
                :class="['export-tab-button', {
                  active: fmt.group
                    ? (fmt.group === 'json' && (exportFormat === 'json' || exportFormat === 'json_without_ids'))
                    || (fmt.group === 'sql' && ['sql', 'parameterized', 'parameterized_named'].includes(exportFormat))
                    || (fmt.group === 'mongodb' && exportFormat === 'mongodb_query')
                    : exportFormat === fmt.value
                }]"
                @click="exportFormat = fmt.value"
              >
                {{ fmt.label }}
              </button>
            </div>
            <div v-if="currentFormatGroup === 'json'" class="export-sub-options">
              <label v-for="subFmt in jsonSubFormats" :key="subFmt.value" class="sub-option-label">
                <input type="radio" :value="subFmt.value" v-model="exportFormat" name="json-format" />
                <span>{{ subFmt.label }}</span>
              </label>
            </div>
            <div v-if="currentFormatGroup === 'sql'" class="export-sub-options">
              <label v-for="subFmt in sqlSubFormats" :key="subFmt.value" class="sub-option-label">
                <input type="radio" :value="subFmt.value" v-model="exportFormat" name="sql-format" />
                <span>{{ subFmt.label }}</span>
              </label>
            </div>
            <div class="export-parse-numbers">
              <label class="parse-numbers-label">
                <input type="checkbox" v-model="parseNumbersInExport" :disabled="options.disabled" />
                <span>Parse numbers</span>
              </label>
            </div>
            <div class="export-preview">
              <pre>{{ exportResult }}</pre>
            </div>
          </div>
        </div>
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
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
}

.demo-header h1 {
  margin: 0 0 4px;
  font-size: 1.35em;
}

.demo-desc {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 14px;
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
  background: var(--el-fill-color-light);
  border-right: 1px solid var(--el-border-color);
  overflow-y: auto;
}

.options-title {
  margin: 0 0 12px;
  font-size: 1.1em;
  color: var(--el-color-primary);
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
  background: var(--el-fill-color);
}

.option-item span {
  font-size: 13px;
}

.options-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.options-actions button {
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  background: var(--el-bg-color);
}

.options-actions button:hover {
  background: var(--el-fill-color);
}

.demo-main {
  flex: 1;
  min-width: 0;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid var(--el-border-color);
}

.query-display {
  width: 400px;
  flex-shrink: 0;
  min-height: 0;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-left: 1px solid var(--el-border-color);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tab-content h2 {
  margin: 0 0 8px;
  font-size: 1em;
  flex-shrink: 0;
}

.query-preview {
  margin: 0 0 16px;
  flex-shrink: 0;
  max-height: 300px;
  background: var(--el-bg-color);
  padding: 12px;
  border-radius: 4px;
  overflow: auto;
  font-size: 12px;
}

.export-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.export-section h3 {
  margin: 0 0 8px;
  font-size: 0.95em;
  color: var(--el-color-primary);
}

.export-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color);
}

.export-tab-button {
  padding: 4px 8px;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  cursor: pointer;
  font-size: 11px;
  color: var(--el-text-color-regular);
  border-radius: 4px;
}

.export-tab-button:hover {
  background: var(--el-fill-color);
  border-color: var(--el-color-primary);
}

.export-tab-button.active {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.export-sub-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.sub-option-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 12px;
}

.export-parse-numbers {
  margin-bottom: 8px;
}

.parse-numbers-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
}

.export-preview {
  flex: 1;
  min-height: 0;
}

.export-preview pre {
  margin: 0;
  flex: 1;
  min-height: 0;
  background: var(--el-bg-color);
  padding: 12px;
  border-radius: 4px;
  overflow: auto;
  font-size: 12px;
}

.validateQuery :deep(.queryBuilder .rule.queryBuilder-invalid .rule-value) {
  background-color: rgba(102, 51, 153, 0.4);
}
.validateQuery :deep(.queryBuilder .rule.queryBuilder-invalid .rule-value::placeholder) {
  color: rgba(102, 51, 153, 0.5);
}
</style>
