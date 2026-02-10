/**
 * 检查值是否为占位符标签
 * @param value 要检查的值
 * @returns 是否为占位符
 */
export function isPlaceholderValue(value: unknown): boolean {
  return value === '------' || value === '~';
}
