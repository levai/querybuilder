/**
 * Vue 3 QueryBuilder types — aligned with react-querybuilder
 *
 * Reuses core types from @react-querybuilder/core and replaces
 * React-specific types (ReactNode, ComponentType, etc.) with Vue equivalents.
 */
import type { Component, VNode } from 'vue';
import type {
  AccessibleDescriptionGenerator,
  BaseOptionMap,
  BaseTranslation,
  BaseTranslations,
  BaseTranslationWithLabel,
  BaseTranslationWithPlaceholders,
  Classname,
  Classnames,
  CommonRuleSubComponentProps as CoreCommonRuleSubComponentProps,
  DropEffect,
  FlexibleOption,
  FlexibleOptionListProp,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  FullOptionList,
  GenericizeRuleGroupType,
  GetOptionIdentifierType,
  GroupOptions,
  InputType,
  MatchConfig,
  MatchMode,
  MatchModeOptions,
  MoveOptions,
  Option,
  ParseNumbersPropConfig,
  Path,
  QueryActions,
  QueryBuilderFlags,
  QueryValidator,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleOrGroupArray,
  RuleType,
  ToFullOption,
  ValidationMap,
  ValidationResult,
  ValueEditorType,
  ValueSource,
  ValueSourceFlexibleOptions,
  ValueSourceFullOptions,
  ValueSources,
} from '@react-querybuilder/core';

// Re-export core types for convenience
export type {
  Classname,
  Classnames,
  FullCombinator,
  FullField,
  FullOperator,
  FullOption,
  FullOptionList,
  GetOptionIdentifierType,
  InputType,
  MatchConfig,
  MatchMode,
  MatchModeOptions,
  Option,
  ParseNumbersPropConfig,
  Path,
  QueryActions,
  QueryBuilderFlags,
  QueryValidator,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleOrGroupArray,
  RuleType,
  ValidationMap,
  ValidationResult,
  ValueEditorType,
  ValueSource,
  ValueSourceFullOptions,
  ValueSources,
};

// ---------------------------------------------------------------------------
// Vue-specific label type (replaces ReactNode)
// ---------------------------------------------------------------------------
export type LabelType = string | VNode;

// ---------------------------------------------------------------------------
// Translations (use string | VNode instead of ReactNode)
// ---------------------------------------------------------------------------
export interface TranslationWithLabel extends BaseTranslationWithLabel<LabelType> {}
export interface Translation extends BaseTranslation {}
export interface TranslationWithPlaceholders extends BaseTranslationWithPlaceholders {}
export interface Translations extends BaseTranslations<LabelType> {}
export type TranslationsFull = {
  [K in keyof Translations]: { [T in keyof Translations[K]]-?: Translations[K][T] };
};

// ---------------------------------------------------------------------------
// Common sub-component props
// ---------------------------------------------------------------------------
export interface CommonSubComponentProps<
  F extends FullOption = FullField,
  O extends string = string,
> {
  className?: string;
  path: Path;
  level: number;
  title?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  validation?: boolean | ValidationResult;
  testID?: string;
  schema: Schema<F, O>;
}

// ---------------------------------------------------------------------------
// Selector / Editor base props
// ---------------------------------------------------------------------------
export interface SelectorOrEditorProps<
  F extends FullOption = FullField,
  O extends string = string,
> extends CommonSubComponentProps<F, O> {
  value?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleOnChange(value: any): void;
}

interface BaseSelectorProps<OptType extends Option> extends SelectorOrEditorProps<ToFullOption<OptType>> {
  options: FullOptionList<OptType>;
}

// ---------------------------------------------------------------------------
// ValueSelector Props
// ---------------------------------------------------------------------------
export interface ValueSelectorProps<OptType extends Option = FullOption>
  extends BaseSelectorProps<OptType> {
  multiple?: boolean;
  listsAsArrays?: boolean;
}

// ---------------------------------------------------------------------------
// Combinator / Field / Operator / ValueSource selector props
// ---------------------------------------------------------------------------
export interface CombinatorSelectorProps extends BaseSelectorProps<FullOption> {
  options: FullOptionList<FullCombinator>;
  rules: RuleOrGroupArray;
  ruleGroup: RuleGroupTypeAny;
}

export interface FieldSelectorProps<F extends FullField = FullField>
  extends BaseSelectorProps<F>,
    CoreCommonRuleSubComponentProps {
  operator?: F extends FullField<string, infer OperatorName> ? OperatorName : string;
}

export interface OperatorSelectorProps
  extends BaseSelectorProps<FullOption>,
    CoreCommonRuleSubComponentProps {
  options: FullOptionList<FullOperator>;
  field: string;
  fieldData: FullField;
}

export interface ValueSourceSelectorProps
  extends BaseSelectorProps<FullOption>,
    CoreCommonRuleSubComponentProps {
  options: FullOptionList<FullOption<ValueSource>>;
  field: string;
  fieldData: FullField;
}

export type VersatileSelectorProps = ValueSelectorProps &
  Partial<FieldSelectorProps> &
  Partial<OperatorSelectorProps> &
  Partial<CombinatorSelectorProps>;

// ---------------------------------------------------------------------------
// MatchModeEditor Props
// ---------------------------------------------------------------------------
export interface MatchModeEditorProps
  extends BaseSelectorProps<FullOption>,
    CoreCommonRuleSubComponentProps {
  match: MatchConfig;
  selectorComponent?: Component;
  numericEditorComponent?: Component;
  classNames: { matchMode: string; matchThreshold: string };
  options: FullOptionList<FullOption<MatchMode>>;
  field: string;
  fieldData: FullField;
}

// ---------------------------------------------------------------------------
// Action Props (buttons)
// ---------------------------------------------------------------------------
export interface ActionProps extends CommonSubComponentProps {
  label?: LabelType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleOnClick(e?: MouseEvent, context?: any): void;
  disabledTranslation?: TranslationWithLabel;
  ruleOrGroup: RuleGroupTypeAny | RuleType;
  rules?: RuleOrGroupArray;
}

// ---------------------------------------------------------------------------
// NotToggle Props
// ---------------------------------------------------------------------------
export interface NotToggleProps extends CommonSubComponentProps {
  checked?: boolean;
  handleOnChange(checked: boolean): void;
  label?: LabelType;
  ruleGroup: RuleGroupTypeAny;
}

// ---------------------------------------------------------------------------
// ShiftActions Props
// ---------------------------------------------------------------------------
export interface ShiftActionsProps extends CommonSubComponentProps {
  labels?: { shiftUp?: LabelType; shiftDown?: LabelType };
  titles?: { shiftUp?: string; shiftDown?: string };
  ruleOrGroup: RuleGroupTypeAny | RuleType;
  shiftUp?: () => void;
  shiftDown?: () => void;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
}

// ---------------------------------------------------------------------------
// DragHandle Props
// ---------------------------------------------------------------------------
export interface DragHandleProps extends CommonSubComponentProps {
  label?: LabelType;
  ruleOrGroup: RuleGroupTypeAny | RuleType;
}

// ---------------------------------------------------------------------------
// InlineCombinator Props
// ---------------------------------------------------------------------------
export interface InlineCombinatorProps extends CombinatorSelectorProps {
  component: Component;
}

// ---------------------------------------------------------------------------
// ValueEditor Props
// ---------------------------------------------------------------------------
export interface ValueEditorProps<F extends FullField = FullField, O extends string = string>
  extends SelectorOrEditorProps<F, O>,
    CoreCommonRuleSubComponentProps {
  field: GetOptionIdentifierType<F>;
  operator: O;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  valueSource: ValueSource;
  fieldData: F;
  type?: ValueEditorType;
  inputType?: InputType | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values?: any[];
  listsAsArrays?: boolean;
  parseNumbers?: ParseNumbersPropConfig;
  separator?: string | VNode | null;
  selectorComponent?: Component;
  skipHook?: boolean;
  schema: Schema<F, O>;
}

// ---------------------------------------------------------------------------
// Controls — all subcomponent types
// ---------------------------------------------------------------------------
export type ControlElementsProp<F extends FullField = FullField, O extends string = string> = Partial<{
  actionElement: Component;
  addGroupAction: Component | null;
  addRuleAction: Component | null;
  cloneGroupAction: Component | null;
  cloneRuleAction: Component | null;
  combinatorSelector: Component | null;
  dragHandle: Component | null;
  fieldSelector: Component | null;
  inlineCombinator: Component | null;
  lockGroupAction: Component | null;
  lockRuleAction: Component | null;
  matchModeEditor: Component | null;
  muteGroupAction: Component | null;
  muteRuleAction: Component | null;
  notToggle: Component | null;
  operatorSelector: Component | null;
  removeGroupAction: Component | null;
  removeRuleAction: Component | null;
  rule: Component;
  ruleGroup: Component;
  ruleGroupBodyElements: Component;
  ruleGroupHeaderElements: Component;
  shiftActions: Component | null;
  valueEditor: Component | null;
  valueSelector: Component;
  valueSourceSelector: Component | null;
}>;

export type Controls<F extends FullField = FullField, O extends string = string> = Required<
  { [K in keyof ControlElementsProp<F, O>]-?: NonNullable<ControlElementsProp<F, O>[K]> }
>;

// ---------------------------------------------------------------------------
// Schema — configuration passed from QueryBuilder to each subcomponent
// ---------------------------------------------------------------------------
export interface Schema<F extends FullField = FullField, O extends string = string> {
  qbId: string;
  fields: FullOptionList<F>;
  fieldMap: Partial<Record<GetOptionIdentifierType<F>, F>>;
  classNames: Classnames;
  combinators: FullOptionList<FullCombinator>;
  controls: Controls<F, O>;
  createRule(): RuleType;
  createRuleGroup(ic?: boolean): RuleGroupTypeAny;
  dispatchQuery(query: RuleGroupTypeAny): void;
  getQuery(): RuleGroupTypeAny;
  getOperators(field: string, meta: { fieldData: F }): FullOptionList<FullOperator>;
  getValueEditorType(field: string, operator: string, meta: { fieldData: F }): ValueEditorType;
  getValueEditorSeparator(field: string, operator: string, meta: { fieldData: F }): string | VNode | null;
  getValueSources(field: string, operator: string, meta: { fieldData: F }): ValueSourceFullOptions;
  getInputType(field: string, operator: string, meta: { fieldData: F }): InputType | null;
  getValues(field: string, operator: string, meta: { fieldData: F }): FullOptionList<Option>;
  getMatchModes(field: string, misc: { fieldData: F }): MatchModeOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSubQueryBuilderProps(field: GetOptionIdentifierType<F>, misc: { fieldData: F }): Record<string, any>;
  getRuleClassname(rule: RuleType, misc: { fieldData: F }): Classname;
  getRuleGroupClassname(ruleGroup: RuleGroupTypeAny): Classname;
  accessibleDescriptionGenerator: AccessibleDescriptionGenerator;
  showCombinatorsBetweenRules: boolean;
  showNotToggle: boolean;
  showShiftActions: boolean;
  showCloneButtons: boolean;
  showLockButtons: boolean;
  showMuteButtons: boolean;
  autoSelectField: boolean;
  autoSelectOperator: boolean;
  autoSelectValue: boolean;
  addRuleToNewGroups: boolean;
  enableDragAndDrop: boolean;
  validationMap: ValidationMap;
  independentCombinators: boolean;
  listsAsArrays: boolean;
  parseNumbers: ParseNumbersPropConfig;
  disabledPaths: Path[];
  suppressStandardClassnames: boolean;
  maxLevels: number;
}

// ---------------------------------------------------------------------------
// Common Rule/Group Props
// ---------------------------------------------------------------------------
interface CommonRuleAndGroupProps<F extends FullField = FullField, O extends string = string> {
  id?: string;
  path: Path;
  parentDisabled?: boolean;
  parentMuted?: boolean;
  translations: TranslationsFull;
  schema: Schema<F, O>;
  actions: QueryActions;
  disabled?: boolean;
  shiftUpDisabled?: boolean;
  shiftDownDisabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
}

// ---------------------------------------------------------------------------
// DnD Props (Vue version with template refs)
// ---------------------------------------------------------------------------
export interface UseRuleGroupDnD {
  isDragging: boolean;
  dragMonitorId: string | symbol;
  isOver: boolean;
  dropMonitorId: string | symbol;
  previewRef: HTMLDivElement | null;
  dragRef: HTMLSpanElement | null;
  dropRef: HTMLDivElement | null;
  dropEffect?: DropEffect;
  groupItems?: boolean;
  dropNotAllowed?: boolean;
}

export interface UseRuleDnD {
  isDragging: boolean;
  dragMonitorId: string | symbol;
  isOver: boolean;
  dropMonitorId: string | symbol;
  dragRef: HTMLSpanElement | null;
  dndRef: HTMLDivElement | null;
  dropEffect?: DropEffect;
  groupItems?: boolean;
  dropNotAllowed?: boolean;
}

// ---------------------------------------------------------------------------
// RuleGroup Props
// ---------------------------------------------------------------------------
export interface RuleGroupProps<F extends FullOption = FullOption, O extends string = string>
  extends CommonRuleAndGroupProps<F, O>,
    Partial<UseRuleGroupDnD> {
  ruleGroup: RuleGroupTypeAny<RuleType<GetOptionIdentifierType<F>, O>>;
  combinator?: string;
  rules?: RuleOrGroupArray;
  not?: boolean;
}

// ---------------------------------------------------------------------------
// Rule Props
// ---------------------------------------------------------------------------
export interface RuleProps<F extends string = string, O extends string = string>
  extends CommonRuleAndGroupProps<FullOption<F>, O>,
    Partial<UseRuleDnD> {
  rule: RuleType<F, O>;
  field?: string;
  operator?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  valueSource?: ValueSource;
}

// ---------------------------------------------------------------------------
// QueryBuilder Context Props
// ---------------------------------------------------------------------------
export interface QueryBuilderContextProps<
  F extends FullField = FullField,
  O extends string = string,
> extends QueryBuilderFlags {
  controlElements?: ControlElementsProp<F, O>;
  controlClassnames?: Partial<Classnames>;
  translations?: Partial<Translations>;
}

// ---------------------------------------------------------------------------
// QueryBuilder Props (main component props)
// ---------------------------------------------------------------------------
export interface QueryBuilderProps<
  RG extends RuleGroupTypeAny = RuleGroupType,
  F extends FullField = FullField,
  O extends FullOperator = FullOperator,
  C extends FullCombinator = FullCombinator,
> extends QueryBuilderContextProps<F, GetOptionIdentifierType<O>> {
  // Controlled / uncontrolled
  /** v-model binding (controlled mode) */
  modelValue?: RG;
  /** Initial query for uncontrolled mode */
  defaultQuery?: RG;
  /** Alias for modelValue, for API compatibility with React version */
  query?: RG;

  // Data
  fields?: FlexibleOptionListProp<F> | BaseOptionMap<F>;
  operators?: FlexibleOptionListProp<O>;
  combinators?: FlexibleOptionListProp<C>;
  baseField?: Record<string, unknown>;
  baseOperator?: Record<string, unknown>;
  baseCombinator?: Record<string, unknown>;

  // Default value functions
  getDefaultField?: GetOptionIdentifierType<F> | ((fieldsData: FullOptionList<F>) => string);
  getDefaultOperator?:
    | GetOptionIdentifierType<O>
    | ((field: GetOptionIdentifierType<F>, misc: { fieldData: F }) => string);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDefaultValue?(rule: RuleType, misc: { fieldData: F }): any;

  // Dynamic config functions
  getOperators?(
    field: GetOptionIdentifierType<F>,
    misc: { fieldData: F }
  ): FlexibleOptionListProp<FullOperator> | null;
  getValueEditorType?(
    field: GetOptionIdentifierType<F>,
    operator: GetOptionIdentifierType<O>,
    misc: { fieldData: F }
  ): ValueEditorType;
  getValueEditorSeparator?(
    field: GetOptionIdentifierType<F>,
    operator: GetOptionIdentifierType<O>,
    misc: { fieldData: F }
  ): string | VNode | null;
  getValueSources?(
    field: GetOptionIdentifierType<F>,
    operator: GetOptionIdentifierType<O>,
    misc: { fieldData: F }
  ): ValueSources | ValueSourceFlexibleOptions;
  getInputType?(
    field: GetOptionIdentifierType<F>,
    operator: GetOptionIdentifierType<O>,
    misc: { fieldData: F }
  ): InputType | null;
  getValues?(
    field: GetOptionIdentifierType<F>,
    operator: GetOptionIdentifierType<O>,
    misc: { fieldData: F }
  ): FlexibleOptionListProp<Option>;
  getMatchModes?(
    field: GetOptionIdentifierType<F>,
    misc: { fieldData: F }
  ): boolean | MatchMode[] | FlexibleOption<MatchMode>[];
  getSubQueryBuilderProps?(
    field: GetOptionIdentifierType<F>,
    misc: { fieldData: F }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any>;
  getRuleClassname?(rule: RuleType, misc: { fieldData: F }): Classname;
  getRuleGroupClassname?(ruleGroup: RG): Classname;

  // Callbacks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddRule?(rule: RuleType, parentPath: Path, query: RG, context?: any): RuleType | boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddGroup?(ruleGroup: RG, parentPath: Path, query: RG, context?: any): RG | boolean;
  onMoveRule?(
    rule: RuleType,
    fromPath: Path,
    toPath: Path | 'up' | 'down',
    query: RG,
    nextQuery: RG,
    options: MoveOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any
  ): RG | boolean;
  onMoveGroup?(
    ruleGroup: RG,
    fromPath: Path,
    toPath: Path | 'up' | 'down',
    query: RG,
    nextQuery: RG,
    options: MoveOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any
  ): RG | boolean;
  onGroupRule?(
    rule: RuleType,
    fromPath: Path,
    toPath: Path,
    query: RG,
    nextQuery: RG,
    options: GroupOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any
  ): RG | boolean;
  onGroupGroup?(
    ruleGroup: RG,
    fromPath: Path,
    toPath: Path,
    query: RG,
    nextQuery: RG,
    options: GroupOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any
  ): RG | boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onRemove?(ruleOrGroup: RuleType | RG, path: Path, query: RG, context?: any): boolean;
  onQueryChange?(query: RG): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLog?(obj: any): void;

  // Configuration
  independentCombinators?: boolean;
  disabled?: boolean | Path[];
  parseNumbers?: ParseNumbersPropConfig;
  validator?: QueryValidator;
  idGenerator?: () => string;
  accessibleDescriptionGenerator?: AccessibleDescriptionGenerator;
  maxLevels?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
}
