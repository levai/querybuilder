/**
 * 获取有效的最大嵌套层级
 * @param maxLevels 用户传入的最大层级（至少为 1）
 * @returns 有效的最大层级，如果未传入或无效则返回 Infinity
 */
export function getEffectiveMaxLevels(maxLevels?: number): number {
  if (maxLevels === undefined || maxLevels === null) return Infinity;
  return Math.max(1, maxLevels);
}
