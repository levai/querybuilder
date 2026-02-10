import { ref } from 'vue';
import { messages } from '../messages';

const warned = ref<Record<string, boolean>>({});

function isDev(): boolean {
  try {
    return typeof process !== 'undefined' && (process as NodeJS.Process).env?.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

/**
 * 与 React useDeprecatedProps 对齐：在开发环境下对废弃用法打一次警告。
 * - QueryBuilder：传了 independentCombinators 时（invalid：query 非 IC 类型；unnecessary：传了即废弃）
 * - RuleGroup：未传 ruleGroup 而用 combinator/not/rules 时
 * - Rule：未传 rule 而用 field/operator/value 时
 */
export function useDeprecatedProps(
  type: 'independentCombinators',
  logWarning: boolean,
  otherParams: 'invalid' | 'unnecessary'
): void;
export function useDeprecatedProps(type: 'rule' | 'ruleGroup', logWarning: boolean): void;
export function useDeprecatedProps(
  type: 'independentCombinators' | 'rule' | 'ruleGroup',
  logWarning: boolean,
  otherParams?: 'invalid' | 'unnecessary'
): void {
  if (!isDev() || !logWarning) return;

  const key = type === 'independentCombinators' ? `${type}-${otherParams ?? ''}` : type;
  if (warned.value[key]) return;
  warned.value[key] = true;

  if (type === 'independentCombinators') {
    if (otherParams === 'invalid') {
      console.warn(messages.errorInvalidIndependentCombinatorsProp);
    } else if (otherParams === 'unnecessary') {
      console.warn(messages.errorUnnecessaryIndependentCombinatorsProp);
    }
    return;
  }

  if (type === 'rule') {
    console.warn(messages.errorDeprecatedRuleProps);
    return;
  }

  if (type === 'ruleGroup') {
    console.warn(messages.errorDeprecatedRuleGroupProps);
  }
}
