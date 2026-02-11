// Re-export everything from @react-querybuilder/core
export * from '@react-querybuilder/core';

// Export barrel (defaults, messages, types, utils)
// Note: Vue version does not export hooks (React-specific), use composables instead
export * from './barrel';

// Export components
export * from './components';

// Export composables (Vue equivalent of React hooks)
export * from './composables';

// Export context
export * from './context/queryBuilderContext';

// Default export
export { QueryBuilder as default } from './components';

// Note: Vue version does not export:
// - redux (React-specific, Vue uses context instead)
// - hooks (React-specific, Vue uses composables instead)
// - QueryBuilderStateProvider (React-specific)
