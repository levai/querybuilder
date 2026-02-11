<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { RuleGroupType, RuleGroupTypeAny, RuleType, ExportFormat, QueryValidator } from '../src';
import { defaultValidator, generateAccessibleDescription, isRuleGroup, formatQuery, QueryBuilder } from '../src';
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

// 导出相关状态
const exportFormat = ref<ExportFormat>('json_without_ids');
const parseNumbersInExport = ref(false);

// 可用的导出格式（与 React demo 对齐）
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

// JSON 格式的子选项
const jsonSubFormats: Array<{ value: ExportFormat; label: string }> = [
  { value: 'json_without_ids', label: 'Without id or path' },
  { value: 'json', label: 'Full query object' },
];

// SQL 格式的子选项
const sqlSubFormats: Array<{ value: ExportFormat; label: string }> = [
  { value: 'sql', label: 'Inline' },
  { value: 'parameterized', label: 'Parameterized' },
  { value: 'parameterized_named', label: 'Named parameters' },
];

// 需要 JSON.stringify 的格式
const objectFormats = new Set<ExportFormat>([
  'jsonlogic',
  'elasticsearch',
  'mongodb_query',
  'parameterized',
  'parameterized_named',
]);

// 计算导出结果
const exportResult = computed(() => {
  try {
    const queryForFormatting = query.value;
    const format = exportFormat.value;
    
    const result = formatQuery(queryForFormatting, {
      format,
      parseNumbers: parseNumbersInExport.value || undefined,
      fields: fields as any,
    });

    // 如果是对象格式，需要 JSON.stringify
    if (objectFormats.has(format)) {
      return JSON.stringify(result, null, 2);
    }
    
    // 字符串格式直接返回
    return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
});

// 当前格式组（用于显示子选项）
const currentFormatGroup = computed(() => {
  const fmt = exportFormats.find(f => f.value === exportFormat.value);
  return fmt?.group;
});

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

function getRulesWithValueTypes() {
  const result: Array<{ field: string; operator: string; valueType: string; isArray: boolean }> = [];
  const walk = (rg: RuleGroupTypeAny) => {
    for (const r of rg.rules) {
      if (typeof r === 'string') continue;
      if (isRuleGroup(r)) {
        walk(r);
      } else {
        const rule = r as RuleType;
        if (rule.field && rule.value !== undefined) {
          const valueType = Array.isArray(rule.value) ? 'array' : typeof rule.value;
          result.push({
            field: rule.field,
            operator: rule.operator || '',
            valueType: `${valueType} (${JSON.stringify(rule.value).substring(0, 50)})`,
            isArray: Array.isArray(rule.value),
          });
        }
      }
    }
  };
  walk(query.value);
  return result;
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
        <div class="tab-content">
          <h2>Query</h2>
          <pre class="query-preview">{{ JSON.stringify(query, null, 2) }}</pre>
          <div v-if="options.listsAsArrays || options.parseNumbers" class="test-hints">
            <h3>测试提示</h3>
            <div v-if="options.listsAsArrays" class="test-hint">
              <strong>Lists as Arrays:</strong> 启用后，多值操作符（between、in、notIn）的值会以数组形式存储。
              <br />测试：选择 "between" 或 "in" 操作符，查看 value 是否为数组格式。
            </div>
            <div v-if="options.parseNumbers" class="test-hint">
              <strong>Parse Numbers:</strong> 启用后，数字输入会被解析为 number 类型。
              <br />测试：选择 "Age" 字段，输入数字，查看 value 的类型（应为数字而非字符串）。
            </div>
            <div class="test-hint-value-types">
              <strong>当前规则值类型检查：</strong>
              <ul>
                <li v-for="(rule, idx) in getRulesWithValueTypes()" :key="idx">
                  {{ rule.field }} ({{ rule.operator }}): 
                  <code>{{ rule.valueType }}</code>
                  <span v-if="rule.isArray"> - 数组</span>
                </li>
              </ul>
            </div>
          </div>

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
            
            <!-- JSON 格式子选项 -->
            <div v-if="currentFormatGroup === 'json'" class="export-sub-options">
              <label
                v-for="subFmt in jsonSubFormats"
                :key="subFmt.value"
                class="sub-option-label"
              >
                <input
                  type="radio"
                  :value="subFmt.value"
                  v-model="exportFormat"
                  name="json-format"
                />
                <span>{{ subFmt.label }}</span>
              </label>
            </div>
            
            <!-- SQL 格式子选项 -->
            <div v-if="currentFormatGroup === 'sql'" class="export-sub-options">
              <label
                v-for="subFmt in sqlSubFormats"
                :key="subFmt.value"
                class="sub-option-label"
              >
                <input
                  type="radio"
                  :value="subFmt.value"
                  v-model="exportFormat"
                  name="sql-format"
                />
                <span>{{ subFmt.label }}</span>
              </label>
            </div>
            
            <!-- Parse numbers 选项 -->
            <div class="export-parse-numbers">
              <label class="parse-numbers-label">
                <input
                  type="checkbox"
                  v-model="parseNumbersInExport"
                  :disabled="options.disabled"
                />
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
  width: 400px;
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
  background: white;
  padding: 12px;
  border-radius: 4px;
  overflow-y: auto;
  overflow-x: auto;
  font-size: 12px;
}

.export-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ddd;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.export-section h3 {
  margin: 0 0 8px;
  font-size: 0.95em;
  color: #2387c4;
}

.export-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
  max-height: 120px;
  overflow-y: auto;
}

.export-tab-button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 11px;
  color: #666;
  border-radius: 3px;
  transition: all 0.2s;
  white-space: nowrap;
}

.export-tab-button:hover {
  background: #f0f0f0;
  border-color: #2387c4;
}

.export-tab-button.active {
  color: #2387c4;
  border-color: #2387c4;
  background: #e3f2fd;
  font-weight: 500;
}

.export-sub-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.sub-option-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 12px;
}

.sub-option-label input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.sub-option-label span {
  user-select: none;
}

.export-parse-numbers {
  margin-bottom: 8px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.parse-numbers-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
}

.parse-numbers-label input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}

.parse-numbers-label input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.parse-numbers-label span {
  user-select: none;
}

.export-preview {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.export-preview pre {
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

.test-hints {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ddd;
  font-size: 12px;
}

.test-hints h3 {
  margin: 0 0 8px;
  font-size: 13px;
  color: #2387c4;
}

.test-hint {
  margin-bottom: 12px;
  padding: 8px;
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  border-radius: 4px;
  line-height: 1.5;
}

.test-hint strong {
  color: #856404;
}

.test-hint-value-types {
  margin-top: 12px;
  padding: 8px;
  background: #d1ecf1;
  border-left: 3px solid #0c5460;
  border-radius: 4px;
}

.test-hint-value-types strong {
  color: #0c5460;
  display: block;
  margin-bottom: 6px;
}

.test-hint-value-types ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
}

.test-hint-value-types li {
  margin-bottom: 4px;
}

.test-hint-value-types code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
}

/* 与 React demo 一致：开启验证时，无效 rule 的 .rule-value 高亮 */
.validateQuery :deep(.queryBuilder .rule.queryBuilder-invalid .rule-value) {
  background-color: rgba(102, 51, 153, 0.4);
}
.validateQuery :deep(.queryBuilder .rule.queryBuilder-invalid .rule-value::placeholder) {
  color: rgba(102, 51, 153, 0.5);
}
</style>
