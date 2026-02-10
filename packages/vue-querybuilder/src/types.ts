import type {
  BaseOptionMap,
  BaseTranslationsFull,
  Classname,
  Classnames as CoreClassnames,
  FlexibleOption,
  FlexibleOptionListProp,
  FullCombinator,
  FullField,
  FullOption,
  FullOperator,
  FullOptionList,
  InputType,
  MatchMode,
  MatchModeOptions,
  Path,
  ParseNumbersPropConfig,
  QueryActions as CoreQueryActions,
  RuleGroupTypeAny,
  RuleType,
  ValueEditorType,
  ValueSource,
  ValueSourceFlexibleOptions,
  ValueSources,
} from '@react-querybuilder/core';
import type { GroupOptions, MoveOptions } from '@react-querybuilder/core';
import type { Component } from 'vue';

/** QueryBuilder 根组件 v-model 的 emit 类型 */
export type Emitter = (e: 'update:modelValue', value: RuleGroupTypeAny) => void;

/** 控件组件类型定义（与 React 细粒度控件对齐，未指定时回退到 actionElement） */
export interface Controls {
  /** 字段选择器组件 */
  fieldSelector: Component;
  /** 操作符选择器组件 */
  operatorSelector: Component;
  /** 值来源选择器组件（value/field），当 getValueSources 返回多于一种时显示 */
  valueSourceSelector?: Component;
  /** 匹配模式编辑器组件（match mode），用于子查询 */
  matchModeEditor?: Component;
  /** 值编辑器组件 */
  valueEditor: Component;
  /** 组合符选择器组件 */
  combinatorSelector: Component;
  /** NOT 切换组件 */
  notToggle: Component;
  /** 默认动作按钮组件（未单独指定时用于所有按钮类控件） */
  actionElement: Component;
  /** 拖拽手柄组件 */
  dragHandle?: Component;
  // --- 细粒度 action 控件（可选，不传则使用 actionElement）---
  addRuleAction?: Component;
  addGroupAction?: Component;
  cloneRuleAction?: Component;
  cloneGroupAction?: Component;
  removeRuleAction?: Component;
  removeGroupAction?: Component;
  lockRuleAction?: Component;
  lockGroupAction?: Component;
  muteRuleAction?: Component;
  muteGroupAction?: Component;
  /** 上/下移按钮组（不传则用两个 actionElement 渲染） */
  shiftActions?: Component;
  /** 规则之间的组合符包装（showCombinatorsBetweenRules 或 independentCombinators 时使用），不传则用默认 InlineCombinator */
  inlineCombinator?: Component;
}

/** 注入到 context 的控件：细粒度 action 已解析为具体组件（未传时回退到 actionElement） */
export type ResolvedControls = Omit<Controls, 'addRuleAction' | 'addGroupAction' | 'cloneRuleAction' | 'cloneGroupAction' | 'removeRuleAction' | 'removeGroupAction' | 'lockRuleAction' | 'lockGroupAction' | 'muteRuleAction' | 'muteGroupAction' | 'shiftActions' | 'inlineCombinator'> & {
  addRuleAction: Component;
  addGroupAction: Component;
  cloneRuleAction: Component;
  cloneGroupAction: Component;
  removeRuleAction: Component;
  removeGroupAction: Component;
  lockRuleAction: Component;
  lockGroupAction: Component;
  muteRuleAction: Component;
  muteGroupAction: Component;
  /** 上/下移组件（可能为单一组件或由两枚 actionElement 组成） */
  shiftActions: Component;
  /** 规则之间的组合符包装组件 */
  inlineCombinator: Component;
};

/** QueryBuilder 根组件 props */
export interface QueryBuilderProps {
  /** 受控：当前 query */
  modelValue?: RuleGroupTypeAny;
  /** 非受控：初始 query */
  defaultQuery?: RuleGroupTypeAny;
  /** 字段列表（数组或 Record<name, FullField>，与 React FlexibleOptionListProp | BaseOptionMap 一致） */
  fields?: FlexibleOptionListProp<FullField> | BaseOptionMap<FullField>;
  /** 应用于所有字段的默认属性（会合并到每条 field 选项） */
  baseField?: Record<string, unknown>;
  /** 操作符列表（与 React FlexibleOptionListProp 一致），不传则用 core 默认 */
  operators?: FlexibleOptionListProp<FullOperator>;
  /** 应用于所有操作符的默认属性 */
  baseOperator?: Record<string, unknown>;
  /** 组合符列表（与 React FlexibleOptionListProp 一致），不传则用 core 默认 */
  combinators?: FlexibleOptionListProp<FullCombinator>;
  /** 应用于所有组合符的默认属性 */
  baseCombinator?: Record<string, unknown>;
  /** query 变更时触发 */
  onUpdateModelValue?: (query: RuleGroupTypeAny) => void;
  /** 是否显示组内 NOT 切换 */
  showNotToggle?: boolean;
  /** 是否显示上/下移动 */
  showShiftActions?: boolean;
  /** 是否显示克隆 */
  showCloneButtons?: boolean;
  /** 是否显示锁定 */
  showLockButtons?: boolean;
  /** 是否显示静音 */
  showMuteButtons?: boolean;
  /** 是否在规则之间显示组合符（inline combinator） */
  showCombinatorsBetweenRules?: boolean;
  /** 是否使用独立组合符模式（当为 true 时，自动将 query 转换为 RuleGroupTypeIC 格式；当为 false 时，转换为 RuleGroupType 格式；不传则根据 query 类型自动检测） */
  independentCombinators?: boolean;
  /** 是否显示分支连接线 */
  showBranches?: boolean;
  /** 是否使用两端对齐布局（+ Rule / + Group / clone / lock / remove 等按钮靠右） */
  justifiedLayout?: boolean;
  /** 禁用整棵树，或按 path 禁用（与 React 一致：disabled={[[]]} 表示根禁用，disabled={[[0],[1,0]]} 表示禁用指定路径） */
  disabled?: boolean | Path[];
  /** 自动选择第一个字段 */
  autoSelectField?: boolean;
  /** 自动选择第一个操作符 */
  autoSelectOperator?: boolean;
  /** 自动选择第一个值（仅适用于选择列表） */
  autoSelectValue?: boolean;
  /** 按字段返回操作符列表；返回 null 时使用 field.operators ?? operators ?? 默认操作符（与 React getOperators 一致） */
  getOperators?: (field: string, misc: { fieldData: FullField }) => FullOperator[] | null;
  /** 新规则或重置时的默认字段：字段 name，或 (fields) => name */
  getDefaultField?: string | ((fieldsData: FullField[]) => string);
  /** 新规则或重置时的默认操作符：操作符 name，或 (field, { fieldData }) => name */
  getDefaultOperator?: string | ((field: string, misc: { fieldData: FullField }) => string);
  /** 新规则或重置时的默认值：(rule, { fieldData }) => value */
  getDefaultValue?: (rule: RuleType, misc: { fieldData: FullField }) => string | number | boolean;
  /** id 生成函数，用于 rule/group 的 id；不传则使用 core 的 generateID */
  idGenerator?: () => string;
  /** 最大嵌套层级（至少 1，不传则不限制） */
  maxLevels?: number;
  /** 无障碍：为规则组根元素生成 title/aria 描述，默认使用 core 的 generateAccessibleDescription */
  accessibleDescriptionGenerator?: (props: { path: Path; qbId: string }) => string;
  /** 数字解析策略：控制 ValueEditor 将字符串解析为数字的方式（true/false/strict/enhanced/native 及 -limited 后缀） */
  parseNumbers?: ParseNumbersPropConfig;
  /** 多值编辑器（如 between）中间的分隔内容，返回字符串或 VNode */
  getValueEditorSeparator?: (field: string, operator: string, misc: { fieldData: FullField }) => string | import('vue').VNode;
  /** 值来源：getValueSources(field, operator) 返回 ['value'] | ['value','field'] 等，用于 ValueSourceSelector 与 core update 重置逻辑 */
  getValueSources?: (field: string, operator: string, misc: { fieldData: FullField }) => ValueSources | ValueSourceFlexibleOptions;
  /** 匹配模式：getMatchModes(field) 返回匹配模式列表，用于 MatchModeEditor 与子查询 */
  getMatchModes?: (field: string, misc: { fieldData: FullField }) => boolean | MatchMode[] | FlexibleOption<MatchMode>[];
  /** 子 QueryBuilder 的 props：getSubQueryBuilderProps(field, misc) 返回子查询的 props，用于子 QueryBuilder */
  getSubQueryBuilderProps?: (field: string, misc: { fieldData: FullField }) => Partial<QueryBuilderProps>;
  /** 值编辑器类型：getValueEditorType(field, operator) 返回 ValueEditorType */
  getValueEditorType?: (field: string, operator: string, misc: { fieldData: FullField }) => ValueEditorType;
  /** 输入类型：getInputType(field, operator) 返回 InputType | null */
  getInputType?: (field: string, operator: string, misc: { fieldData: FullField }) => InputType | null;
  /** 值选项列表：getValues(field, operator) 返回选项列表 */
  getValues?: (field: string, operator: string, misc: { fieldData: FullField }) => FullOption[];
  /** 字段改变时重置操作符和值 */
  resetOnFieldChange?: boolean;
  /** 操作符改变时重置值 */
  resetOnOperatorChange?: boolean;
  /** 新组自动添加规则 */
  addRuleToNewGroups?: boolean;
  /** 启用拖拽 */
  enableDragAndDrop?: boolean;
  /** 调试模式 */
  debugMode?: boolean;
  /** 调试日志回调 */
  onLog?: (...params: unknown[]) => void;
  /** 挂载时触发 queryChange */
  enableMountQueryChange?: boolean;
  /** 列表作为数组 */
  listsAsArrays?: boolean;
  /** 禁止分配标准类名到元素（包括验证、拖拽等条件类和事件类） */
  suppressStandardClassnames?: boolean;
  /** 校验：根级 (query)=>boolean|ValidationMap，或按节点 (ruleOrGroup)=>boolean|ValidationResult */
  validator?: (queryOrRuleOrGroup: RuleGroupTypeAny | RuleType | RuleGroupTypeAny) => boolean | { valid: boolean; reasons?: string[] } | Record<string, boolean | { valid: boolean; reasons?: string[] }>;
  /** 添加规则前回调，返回 false 取消，返回 RuleType 则用其作为新规则（与 React 一致，支持可选 context） */
  onAddRule?: (rule: RuleType, parentPath: Path, query: RuleGroupTypeAny, context?: unknown) => RuleType | boolean;
  /** 添加组前回调，返回 false 取消，返回 RuleGroupType 则用其作为新组（与 React 一致，支持可选 context） */
  onAddGroup?: (group: RuleGroupTypeAny, parentPath: Path, query: RuleGroupTypeAny, context?: unknown) => RuleGroupTypeAny | boolean;
  /** 移除前回调，返回 false 取消移除（与 React 一致，支持可选 context） */
  onRemove?: (ruleOrGroup: RuleType | RuleGroupTypeAny, path: Path, query: RuleGroupTypeAny, context?: unknown) => boolean;
  /** 移动规则前回调，返回 false 取消，返回 true 用 nextQuery，返回新 query 则用其替换 */
  onMoveRule?: (
    rule: RuleType,
    fromPath: Path,
    toPath: Path | 'up' | 'down',
    query: RuleGroupTypeAny,
    nextQuery: RuleGroupTypeAny,
    options: MoveOptions,
    context?: unknown
  ) => RuleGroupTypeAny | boolean;
  /** 移动组前回调，返回 false 取消，返回 true 用 nextQuery，返回新 query 则用其替换 */
  onMoveGroup?: (
    group: RuleGroupTypeAny,
    fromPath: Path,
    toPath: Path | 'up' | 'down',
    query: RuleGroupTypeAny,
    nextQuery: RuleGroupTypeAny,
    options: MoveOptions,
    context?: unknown
  ) => RuleGroupTypeAny | boolean;
  /** 将规则与目标成组前回调，返回 false 取消，返回新 query 则用其替换 */
  onGroupRule?: (
    rule: RuleType,
    fromPath: Path,
    toPath: Path,
    query: RuleGroupTypeAny,
    nextQuery: RuleGroupTypeAny,
    options?: GroupOptions,
    context?: unknown
  ) => RuleGroupTypeAny | boolean;
  /** 将组与目标成组前回调，返回 false 取消，返回新 query 则用其替换 */
  onGroupGroup?: (
    group: RuleGroupTypeAny,
    fromPath: Path,
    toPath: Path,
    query: RuleGroupTypeAny,
    nextQuery: RuleGroupTypeAny,
    options?: GroupOptions,
    context?: unknown
  ) => RuleGroupTypeAny | boolean;
  /** 自定义控件组件 */
  controls?: Partial<Controls>;
  /** 透传到所有子组件的数据，供自定义控件读取（与 React context 一致） */
  context?: unknown;
  /** 自定义翻译文本，会与默认翻译合并 */
  translations?: Partial<BaseTranslationsFull>;
  /** 样式类名（标准结构 + 拖拽），与默认合并，可部分覆盖以自定义样式 */
  classnames?: Partial<QueryBuilderClassnames>;
  /** 按规则自定义根节点 class，用于 Rule 外层 div */
  getRuleClassname?: (rule: RuleType, misc: { fieldData?: FullField }) => Classname;
  /** 按规则组自定义根节点 class，用于 RuleGroup 外层 div */
  getRuleGroupClassname?: (ruleGroup: RuleGroupTypeAny) => Classname;
}

/** 统一样式类名：core Classnames + justified，含标准结构与拖拽（core standardClassnames 已含拖拽类名） */
export type QueryBuilderClassnames = CoreClassnames & { justified?: Classname };

/** 供 RuleGroup/Rule 注入的 context 类型 */
export interface QueryBuilderContextValue {
  fields: Array<FullOption>;
  /** 解析后的字段列表（支持 fields 为数组或 Record），供 filterFieldsByComparator 等使用 */
  resolvedFieldsList: FullOptionList<FullField>;
  operators: Array<FullOption>;
  combinators: Array<FullOption>;
  translations: Record<string, { label?: string; title?: string }>;
  /** 与 core QueryActions 一致 */
  actions: CoreQueryActions;
  /** 创建默认 rule，供 RuleGroup 调用 onRuleAdd(rule, path) 前使用 */
  createRule: () => RuleType;
  /** 创建默认 group，供 RuleGroup 调用 onGroupAdd(group, path) 前使用 */
  createRuleGroup: () => RuleGroupTypeAny;
  showNotToggle: boolean;
  showShiftActions: boolean;
  showCloneButtons: boolean;
  showLockButtons: boolean;
  showMuteButtons: boolean;
  showCombinatorsBetweenRules: boolean;
  showBranches: boolean;
  /** 是否使用独立组合符（通过检查 query 类型自动判断，RuleGroupTypeIC 时为 true） */
  independentCombinators: boolean;
  /** 根级禁用（props.disabled === true 或 props.disabled 包含 []） */
  disabled: boolean;
  /** 按 path 禁用列表，用于 isPathDisabled 判断 */
  disabledPaths: Path[];
  autoSelectField: boolean;
  autoSelectOperator: boolean;
  autoSelectValue: boolean;
  resetOnFieldChange: boolean;
  resetOnOperatorChange: boolean;
  addRuleToNewGroups: boolean;
  enableDragAndDrop: boolean;
  debugMode: boolean;
  enableMountQueryChange: boolean;
  listsAsArrays: boolean;
  suppressStandardClassnames: boolean;
  /** 按节点校验；若存在 validationMap 则优先用 validationMap[id]；可与 props.validator 同类型 */
  validator?: (ruleOrGroup: RuleType | RuleGroupTypeAny) => boolean | { valid: boolean; reasons?: string[] } | Record<string, boolean | { valid: boolean; reasons?: string[] }>;
  /** 根级 validator(query) 返回的校验表，Rule/RuleGroup 用 validationMap[id] */
  validationMap?: Record<string, boolean | { valid: boolean; reasons?: string[] }>;
  /** 当前 query 对象，用于 pathIsDisabled 等工具函数 */
  query: RuleGroupTypeAny;
  getOperatorOptions: (field: string, misc: { fieldData: FullField }) => Array<FullOption>;
  getValueEditorType: (field: string, operator: string, misc: { fieldData: FullField }) => ValueEditorType;
  getInputType: (field: string, operator: string, misc: { fieldData: FullField }) => InputType | null;
  getValues: (field: string, operator: string, misc: { fieldData: FullField }) => Array<FullOption>;
  /** 获取值编辑器的占位符文本 */
  getValuePlaceholder: (field: string, operator: string) => string | undefined;
  /** 控件组件（细粒度 action 已解析，可直接使用） */
  controls: ResolvedControls;
  /** 样式类名（标准结构 + 拖拽，已与默认合并，suppressStandardClassnames 时标准键为空） */
  classnames: QueryBuilderClassnames;
  /** 根据字段名取字段定义，供 getRuleClassname 等使用 */
  getFieldData: (fieldName: string) => FullField | undefined;
  /** 按规则自定义根节点 class；不传则不加 */
  getRuleClassname?: (rule: RuleType, misc: { fieldData?: FullField }) => Classname;
  /** 按规则组自定义根节点 class；不传则不加 */
  getRuleGroupClassname?: (ruleGroup: RuleGroupTypeAny) => Classname;
  /** 最大嵌套层级；不传则不限制，RuleGroup 据此禁用"添加组" */
  maxLevels?: number;
  /** QueryBuilder 实例 id，用于 accessibleDescriptionGenerator 等 */
  qbId: string;
  /** 无障碍：为规则组根元素生成 title/aria 描述 */
  accessibleDescriptionGenerator: (props: { path: Path; qbId: string }) => string;
  /** 数字解析策略，供 ValueEditor 使用 */
  parseNumbers?: ParseNumbersPropConfig;
  /** 多值编辑器（between/notBetween）中间的分隔内容 */
  getValueEditorSeparator?: (field: string, operator: string, misc: { fieldData?: FullField }) => string | import('vue').VNode;
  /** 值来源：供 update 与 ValueSourceSelector 使用 */
  getValueSources?: (field: string, operator: string) => ValueSources | ValueSourceFlexibleOptions;
  /** 获取值来源选项列表 { label, value }[]，供 ValueSourceSelector 渲染 */
  getValueSourceOptions: (field: string, operator: string) => Array<FullOption>;
  /** 获取匹配模式选项列表，供 MatchModeEditor 渲染 */
  getMatchModeOptions: (field: string) => MatchModeOptions;
  /** 获取子 QueryBuilder 的 props，供子 QueryBuilder 使用 */
  getSubQueryBuilderProps?: (field: string, misc: { fieldData?: FullField }) => Partial<QueryBuilderProps>;
  /** 透传的业务上下文，自定义控件可通过 inject 读取 */
  context?: unknown;
}

/** 直接使用 core QueryActions，与 core 保持一致 */
export type QueryActions = CoreQueryActions;

// 重导出核心类型，方便用户统一从 UI 包导入
export type {
  Path,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleType,
  FullOperator,
  FullCombinator,
  FullField,
  ValueEditorType,
  InputType,
  MoveOptions,
} from '@react-querybuilder/core';
