<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { Field, RuleGroupType } from '@react-querybuilder/core';
import { defaultValidator } from '@react-querybuilder/core';
import { QueryBuilder } from '../src';

const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'age', label: 'Age', inputType: 'number' },
  { name: 'address', label: 'Address' },
  { name: 'phone', label: 'Phone' },
  { name: 'email', label: 'Email', validator: ({ value }) => /^[^@]+@[^@]+/.test(value) },
  { name: 'twitter', label: 'Twitter' },
  { name: 'isDev', label: 'Is a Developer?', valueEditorType: 'checkbox', defaultValue: false },
];

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

const query = ref<RuleGroupType>(initialQuery);

// 基础选项开关
const options = reactive({
  showNotToggle: false,
  showCloneButtons: false,
  showLockButtons: false,
  showMuteButtons: false,
  showShiftActions: false,
  showCombinatorsBetweenRules: false,
  resetOnFieldChange: true,
  resetOnOperatorChange: false,
  autoSelectField: true,
  autoSelectOperator: true,
  disabled: false,
  validateQuery: false,
});

// 计算 QueryBuilder 的 props
const queryBuilderProps = computed(() => {
  const props = {
    fields,
    showNotToggle: options.showNotToggle,
    showCloneButtons: options.showCloneButtons,
    showLockButtons: options.showLockButtons,
    showMuteButtons: options.showMuteButtons,
    showShiftActions: options.showShiftActions,
    showCombinatorsBetweenRules: options.showCombinatorsBetweenRules,
    resetOnFieldChange: options.resetOnFieldChange,
    resetOnOperatorChange: options.resetOnOperatorChange,
    autoSelectField: options.autoSelectField,
    autoSelectOperator: options.autoSelectOperator,
    disabled: options.disabled,
    validator: options.validateQuery ? defaultValidator : undefined,
  };
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('[App.vue] queryBuilderProps computed:', {
      showCloneButtons: props.showCloneButtons,
      showLockButtons: props.showLockButtons,
      showMuteButtons: props.showMuteButtons,
      showNotToggle: props.showNotToggle,
      showShiftActions: props.showShiftActions,
      showCombinatorsBetweenRules: props.showCombinatorsBetweenRules,
      options: {
        showCloneButtons: options.showCloneButtons,
        showLockButtons: options.showLockButtons,
        showMuteButtons: options.showMuteButtons,
      },
    });
  }
  
  return props;
});
</script>

<template>
  <div class="demo-container">
    <h1>Vue QueryBuilder Demo</h1>
    
    <div class="controls-panel">
      <h2>Controls</h2>
      <div class="controls-grid">
        <label>
          <input type="checkbox" v-model="options.showNotToggle" />
          <span>Show "Not" toggle</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.showCloneButtons" />
          <span>Show clone buttons</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.showLockButtons" />
          <span>Show lock buttons</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.showMuteButtons" />
          <span>Show mute buttons</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.showShiftActions" />
          <span>Show shift actions</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.showCombinatorsBetweenRules" />
          <span>Combinators between rules</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.resetOnFieldChange" />
          <span>Reset on field change</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.resetOnOperatorChange" />
          <span>Reset on operator change</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.autoSelectField" />
          <span>Auto-select field</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.autoSelectOperator" />
          <span>Auto-select operator</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.disabled" />
          <span>Disabled</span>
        </label>
        <label>
          <input type="checkbox" v-model="options.validateQuery" />
          <span>Use validation</span>
        </label>
      </div>
    </div>

    <QueryBuilder v-model="query" v-bind="queryBuilderProps" />
    
    <div class="query-display">
      <h2>Query Object:</h2>
      <pre>{{ JSON.stringify(query, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls-panel {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;
}

.controls-panel h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.controls-grid label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px;
}

.controls-grid label:hover {
  background: #f0f0f0;
  border-radius: 3px;
}

.controls-grid input[type="checkbox"] {
  cursor: pointer;
}

.query-display {
  margin-top: 40px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.query-display h2 {
  margin-top: 0;
}

.query-display pre {
  background: white;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
