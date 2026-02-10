import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import QueryBuilder from './QueryBuilder.vue';
import { standardClassnames } from '@react-querybuilder/core';

// 测试环境无真实 DOM 时 @vue-dnd-kit 会报 "ElementRef is not set"，mock 掉
const mockElement = typeof document !== 'undefined' ? document.createElement('div') : null;
vi.mock('@vue-dnd-kit/core', () => ({
  useDnDStore: () => ({
    keyboard: { alt: ref(false), ctrl: ref(false), meta: ref(false) },
  }),
  useDraggable: () => ({
    elementRef: ref(mockElement),
    isDragging: ref(false),
    handleDragStart: () => {},
  }),
  useDroppable: () => ({
    elementRef: ref(mockElement),
    isOvered: ref(false),
    isAllowed: ref(true),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const defaultQuery = {
  id: 'root',
  combinator: 'and' as const,
  rules: [] as any[],
  not: false,
};

describe('QueryBuilder', () => {
  it('renders with default query', () => {
    const wrapper = mount(QueryBuilder, {
      props: { defaultQuery },
    });
    expect(wrapper.find('[data-testid="rule-group"]').exists()).toBe(true);
  });

  it('has role="form"', () => {
    const wrapper = mount(QueryBuilder, {
      props: { defaultQuery },
    });
    expect(wrapper.find('[role="form"]').exists()).toBe(true);
  });

  it('applies standard classnames by default', () => {
    const wrapper = mount(QueryBuilder, {
      props: { defaultQuery },
    });
    const root = wrapper.find('[role="form"]');
    expect(root.classes()).toContain(standardClassnames.queryBuilder);
  });

  it('respects suppressStandardClassnames', () => {
    const wrapper = mount(QueryBuilder, {
      props: {
        defaultQuery,
        suppressStandardClassnames: true,
      },
    });
    const root = wrapper.find('[role="form"]');
    expect(root.classes()).not.toContain(standardClassnames.queryBuilder);
  });

  it('passes validator and validationMap into schema', () => {
    const validator = vi.fn(() => ({ root: true }));
    mount(QueryBuilder, {
      props: {
        defaultQuery: { ...defaultQuery, id: 'root' },
        fields: [{ name: 'f', label: 'F' }],
        validator,
      },
    });
    expect(validator).toHaveBeenCalled();
  });

  it('calls onUpdateModelValue when adding a rule (uncontrolled)', async () => {
    const onUpdate = vi.fn();
    const wrapper = mount(QueryBuilder, {
      props: {
        defaultQuery,
        fields: [{ name: 'f', label: 'F' }],
        onUpdateModelValue: onUpdate,
        enableMountQueryChange: false,
      },
    });
    const addRuleBtn = wrapper.findAll('button').find((w) => w.attributes('title') === 'Add rule');
    expect(addRuleBtn).toBeDefined();
    await addRuleBtn!.trigger('click');
    expect(onUpdate).toHaveBeenCalled();
    const callWithNewRule = onUpdate.mock.calls.find((call: unknown[]) => (call[0] as { rules?: unknown[] })?.rules?.length === 1);
    expect(callWithNewRule).toBeDefined();
    expect(callWithNewRule![0].rules).toHaveLength(1);
  });
});
