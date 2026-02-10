<script setup lang="ts">
import { ref } from 'vue';
import { QueryBuilder } from '../src';
import type { RuleGroupType } from '@react-querybuilder/core';

const query = ref<RuleGroupType>({
  combinator: 'and',
  rules: [{ field: 'name', operator: '=', value: '' }],
});

const fields = [
  { name: 'name', label: 'Name', value: 'name' },
  { name: 'age', label: 'Age', value: 'age' },
  { name: 'food', label: 'Food', value: 'food' },
];
</script>

<template>
  <div class="dev-app">
    <h1>Vue Query Builder</h1>
    <QueryBuilder
      v-model="query"
      :fields="fields"
    />
    <pre>{{ JSON.stringify(query, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.dev-app {
  padding: 1rem;
  font-family: system-ui, sans-serif;
}
pre {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0f0f0;
  overflow: auto;
}
</style>
