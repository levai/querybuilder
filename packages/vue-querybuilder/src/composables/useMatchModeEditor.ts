import type { FullField, MatchMode, RuleType } from '@react-querybuilder/core';
import { lc, parseNumber } from '@react-querybuilder/core';
import { computed } from 'vue';
import type { MatchModeEditorProps, Schema } from '../types';

const dummyFieldData: FullField = { name: '', value: '', label: '' };
const requiresThreshold = (mm?: string | null) =>
  ['atleast', 'atmost', 'exactly'].includes(lc(mm) ?? /* istanbul ignore next */ '');

export interface UseMatchModeEditor {
  thresholdNum: number;
  thresholdRule: RuleType;
  thresholdSchema: Schema<FullField, string>;
  handleChangeMode: (mode: MatchMode) => void;
  handleChangeThreshold: (threshold: number) => void;
}

export const useMatchModeEditor = (props: MatchModeEditorProps): UseMatchModeEditor => {
  const { match, handleOnChange } = props;

  const thresholdNum = computed(() =>
    typeof match.threshold === 'number' ? Math.max(0, match.threshold) : 1
  ).value;
  
  const thresholdRule = computed(() => ({
    field: '',
    operator: '=',
    value: thresholdNum.value,
  })).value as RuleType;
  
  const thresholdSchema = computed(() => ({
    ...props.schema,
    parseNumbers: true,
  })).value as Schema<FullField, string>;

  const handleChangeMode = (mode: MatchMode) => {
    if (requiresThreshold(mode) && typeof match.threshold !== 'number') {
      handleOnChange({ ...match, mode, threshold: 1 });
    } else {
      handleOnChange({ ...match, mode });
    }
  };

  const handleChangeThreshold = (threshold: number) => {
    handleOnChange({
      ...match,
      threshold: parseNumber(threshold, { parseNumbers: true }),
    });
  };

  return {
    thresholdNum: thresholdNum.value,
    thresholdRule,
    thresholdSchema,
    handleChangeMode,
    handleChangeThreshold,
  };
};
