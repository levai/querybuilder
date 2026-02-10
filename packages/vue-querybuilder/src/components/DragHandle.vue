<script setup lang="ts">
import type { RuleGroupTypeAny, RuleType, Path } from '@react-querybuilder/core';

const props = defineProps<{
  ruleOrGroup: RuleType | RuleGroupTypeAny;
  path: Path;
  disabled?: boolean;
  enableDragAndDrop?: boolean;
  title?: string;
  label?: string;
  className?: string;
  testID?: string;
}>();
</script>

<template>
  <span
    v-if="enableDragAndDrop && !disabled"
    :class="['drag-handle', className]"
    :title="title ?? 'Drag to reorder'"
    :data-testid="testID"
  >
    {{ label ?? '⋮⋮' }}
  </span>
</template>
