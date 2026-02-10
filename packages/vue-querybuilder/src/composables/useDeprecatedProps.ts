import { messages } from '../messages';

/**
 * Logs an error to the console if any of the following are true:
 * - `QueryBuilder` is rendered with an `independentCombinators` prop
 * - `RuleGroup` is rendered with `combinator` or `rules` props (deprecated in favor of `ruleGroup`)
 * - `Rule` is rendered with `field`, `operator`, or `value` props (deprecated in favor of `rule`)
 *
 * @group Composables
 */
function useDeprecatedProps(
  type: 'independentCombinators',
  logWarning: boolean,
  otherParams: 'invalid' | 'unnecessary'
): void;
function useDeprecatedProps(type: 'rule' | 'ruleGroup', logWarning: boolean): void;
function useDeprecatedProps(
  /** Type of error to be logged, if logWarning is true. */
  type: 'independentCombinators' | 'rule' | 'ruleGroup',
  /** If true, the error (well...warning, really) will be logged. */
  logWarning: boolean,
  otherParams?: 'invalid' | 'unnecessary'
) {
  if (process.env.NODE_ENV !== 'production' && logWarning) {
    if (type === 'independentCombinators') {
      if (otherParams === 'invalid') {
        console.warn(messages.errorInvalidIndependentCombinatorsProp);
      }

      if (otherParams === 'unnecessary') {
        console.warn(messages.errorUnnecessaryIndependentCombinatorsProp);
      }
    }

    if (type === 'rule') {
      console.warn(messages.errorDeprecatedRuleProps);
    }

    if (type === 'ruleGroup') {
      console.warn(messages.errorDeprecatedRuleGroupProps);
    }
  }
}

export { useDeprecatedProps };
