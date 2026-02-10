import { queryBuilderFlagDefaults } from '@react-querybuilder/core';
import type { QueryBuilderFlags } from '@react-querybuilder/core';

/**
 * Vue QueryBuilder 默认值
 *
 * 包含核心包的默认值 + Vue 特有的 UI 参数默认值
 */
export const queryBuilderDefaults: QueryBuilderFlags & {
  showBranches: boolean;
  justifiedLayout: boolean;
} = {
  // 核心包参数（从 queryBuilderFlagDefaults 继承）
  ...queryBuilderFlagDefaults,
  // Vue 特有的 UI 参数
  showBranches: false,
  justifiedLayout: false,
};
