<script setup lang="ts">
import { computed } from 'vue';
import { ElButton } from 'element-plus';
import {
  Plus,
  Delete,
  CopyDocument,
  FolderAdd,
  Lock,
  Unlock,
  MuteNotification,
  Bell,
} from '@element-plus/icons-vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    title?: string;
    className?: string;
    disabled?: boolean;
    handleOnClick?: (e?: MouseEvent) => void;
    ruleOrGroup?: unknown;
    /** 显式传入锁定/静音状态，避免依赖 ruleOrGroup 引用导致图标不更新 */
    locked?: boolean;
    muted?: boolean;
    testId?: string;
  }>(),
  { disabled: false }
);

const actionIcon = computed(() => {
  const id = props.testId ?? '';
  const rog = props.ruleOrGroup as { disabled?: boolean; muted?: boolean } | null | undefined;
  const isLocked = props.locked ?? rog?.disabled === true;
  const isMuted = props.muted ?? rog?.muted === true;
  if (id === 'add-rule') return Plus;
  if (id === 'add-group') return FolderAdd;
  if (id === 'clone-rule' || id === 'clone-group') return CopyDocument;
  if (id === 'lock-rule' || id === 'lock-group') return isLocked ? Lock : Unlock;
  if (id === 'mute-rule' || id === 'mute-group') return isMuted ? MuteNotification : Bell;
  if (id === 'remove-rule' || id === 'remove-group') return Delete;
  return undefined;
});

const buttonType = computed(() => {
  const id = props.testId ?? '';
  return id === 'remove-rule' || id === 'remove-group' ? 'danger' : 'primary';
});
</script>

<template>
  <ElButton
    :type="buttonType"
    :icon="actionIcon"
    :class="className"
    :title="title"
    :disabled="disabled"
    :data-testid="testId"
    @click="handleOnClick"
  </ElButton>
</template>
