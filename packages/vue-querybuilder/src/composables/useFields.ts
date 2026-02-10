import type {
  FullCombinator,
  FullField,
  FullOperator,
  FullOptionList,
  FullOptionRecord,
  RuleGroupTypeAny,
} from '@react-querybuilder/core';
import { prepareOptionList } from '@react-querybuilder/core';
import { computed } from 'vue';
import type { QueryBuilderProps, TranslationsFull } from '../types';

export interface UseFields<F extends FullField> {
  defaultField: FullField;
  fields: FullOptionList<F>;
  fieldMap: Partial<FullOptionRecord<FullField>>;
}

export const useFields = <F extends FullField>(
  props: { translations: TranslationsFull } & Pick<
    QueryBuilderProps<RuleGroupTypeAny, F, FullOperator, FullCombinator>,
    'fields' | 'baseField' | 'autoSelectField'
  >
): UseFields<F> => {
  const {
    optionList: fields,
    optionsMap: fieldMap,
    defaultOption: defaultField,
  } = computed(() =>
    prepareOptionList({
      placeholder: props.translations.fields,
      optionList: props.fields,
      autoSelectOption: props.autoSelectField,
      baseOption: props.baseField,
    })
  ).value;

  return { fields, fieldMap, defaultField };
};
