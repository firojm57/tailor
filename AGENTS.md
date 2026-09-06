# Project Execution Rules & Guidelines

Every code modification or task execution in this repository MUST strictly follow the `clean-code-architecture` skill instructions:

1. **SOLID & KISS Principles**: Keep code simple, readable, and single-responsibility.
2. **Zero Duplicate UI Elements**: Never render duplicate buttons, form controls, or redundant action handlers (e.g. only one canonical Save Invoice button).
3. **Dead Code Cleanup**: After every edit or bug fix, audit and immediately remove unused variables, dead methods, orphaned imports, and commented-out legacy code.
4. **Reactive Observable Streams**: All UI data mutations (`StorageService`) must return RxJS `Observable` streams and be subscribed to before updating state signals or closing modals.
5. **Unified Error Handling**: Catch all HTTP API errors and display red toast notifications (`type: 'danger'`, 7s duration with manual dismiss button). Never use browser `alert()` popups.
6. **Viewport-Contained 60:40 Layouts**: Use 60:40 grid ratios (`lg:grid-cols-5`), lock full screen viewport without page-level scrollbars, and apply `truncate` + `overflow-x-hidden` on tables to eliminate horizontal scrollbars.
7. **Verification**: Always run `npm test -- --watch=false` to verify code correctness before completing any task.
