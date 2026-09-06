---
name: clean-code-architecture
description: Comprehensive rules and guidelines for Clean Code, SOLID principles, KISS, design patterns, separation of concerns, dead code removal, reactive UI state updates, and error handling across both Angular UI (taui) and Spring Boot Backend (tailor-service). Invocable on every code change task.
---

# Clean Code & Architectural Guidelines

This skill defines mandatory architectural standards, design principles, and code hygiene practices for the Royal Tailor application (`taui` frontend and `tailor-service` backend).

---

## 1. Core Principles

### KISS (Keep It Simple, Stupid)
- Write simple, direct, readable, and maintainable code.
- Avoid over-engineering, complex abstractions, or speculative generalizations.
- Maintain a single, clear source of truth for UI actions and data mutations.

### SOLID Principles
- **S - Single Responsibility**: Each component, service, controller, or helper class must have one well-defined responsibility.
- **O - Open/Closed**: Entities should be open for extension but closed for modification.
- **L - Liskov Substitution**: Derived classes or interface implementations must be completely substitutable for base types.
- **I - Interface Segregation**: Expose small, focused interfaces rather than bloated ones.
- **D - Dependency Inversion**: Depend on abstractions, not concrete implementations.
  - *Spring Boot*: Use explicit constructor injection for dependencies (prohibit field `@Autowired`).
  - *Angular*: Inject services via `inject(StorageService)` or constructor parameters.

### Separation of Concerns
- **Frontend (`taui`)**:
  - `StorageService`: Centralized data fetching, RxJS HTTP requests, signal state management, and toast notifications.
  - `Components`: Form bindings, user interaction handlers, and view-state toggles.
  - `HTML Templates`: Declarative structural directive loops (`@for`, `@if`) and clean class bindings without inline logic clutter.
- **Backend (`tailor-service`)**:
  - `Controllers`: Map HTTP endpoints, validate DTO payloads, and delegate to services.
  - `Services`: Core business logic exposed via Java interfaces with concrete implementations in `impl`.
  - `DAOs / Repositories`: Database access layers only.

### Zero Duplicate UI & Dead Code Removal
- **No Duplicate Action Elements**: Never render duplicate buttons (e.g. duplicate "Save Invoice" buttons) or redundant event handlers for the same action.
- **Dead Code Audit**: After every code edit or bug fix, immediately remove:
  - Unused imports and variables.
  - Commented-out legacy code blocks.
  - Orphaned helper functions or dead event handlers.
  - Redundant or unused CSS styles.

---

## 2. Angular UI Guidelines (`taui`)

### Reactive Observable Streams & Instant UI Refresh
- All CRUD methods in `StorageService` (`addMeasurement`, `updateMeasurement`, `deleteMeasurement`, `addBill`, `updateBill`, `deleteBill`, `addClothingType`, `updateClothingType`, `deleteClothingType`) **MUST return RxJS `Observable` streams**.
- Components **MUST subscribe to the service Observable** before closing slide-over panels/drawers, resetting local forms, or navigating routes:
  ```typescript
  this.storageService.addMeasurement(payload).subscribe({
    next: () => {
      this.isCreating.set(false);
      this.loadPagedData();
    }
  });
  ```
- **NEVER** update component signals or navigate routes speculatively before the backend API response completes.

### Unified Toast Notifications & Error Handling
- Catch errors on all HTTP API call streams using RxJS `catchError` or subscription `error:` callbacks.
- Pass errors to `StorageService.showToast(message, 'danger')`.
- **Toast Properties**:
  - Success toasts (`type: 'info' | 'success'`): 4-second auto-dismiss.
  - Danger/Error toasts (`type: 'danger'`): 7-second display with manual dismiss button `(click)="storageService.clearToast()"`.
- **PROHIBITED**: `alert()` or native browser popups are strictly forbidden everywhere in the application.

### Category-Driven Configuration
- Clothing category attributes (such as available styles/varieties) MUST be stored in DB schema (`style_list`) and exposed dynamically via `<select>` dropdowns in forms and modals.
- Never use hardcoded text inputs for options that belong to category configurations.

### Viewport-Contained 60:40 Layout System
- **Grid Layout**: Use exact 60:40 responsive column grid splits (`lg:grid-cols-5` with `lg:col-span-3` left and `lg:col-span-2` right).
- **Viewport Lock**: Lock full page height with `h-full flex flex-col p-6 overflow-hidden` to prevent page-level vertical scrollbars on standard displays.
- **Zero Horizontal Table Scroll**:
  - Use `table-fixed` with proportional column widths.
  - Apply `truncate` and `[title]="item.keyDimensions"` tooltip to text fields.
  - Container must use `overflow-x-hidden`.
  - Confine vertical scrolling strictly to table bodies (`tbody` inside `overflow-y-auto min-h-0`).

---

## 3. Spring Boot Backend Guidelines (`tailor-service`)

### Constructor Injection & DTO Mapping
- Inject dependencies strictly via constructor:
  ```java
  private final VarietyService varietyService;

  public VarietyController(VarietyService varietyService) {
      this.varietyService = varietyService;
  }
  ```
- Always transfer data using DTOs (`VarietyDto`, `MeasurementDto`, `BillDto`). Do not expose entity objects directly over HTTP endpoints.

### SQLite Array Converter Serialization
- Use Jackson `ObjectMapper` `AttributeConverter` implementations (e.g. `StringListConverter`) to serialize Java `List<String>` objects to SQLite JSON text columns (`style_list`, `measure_list`).

---

## 4. Invocable Code Change Checklist

Whenever executing any task or code modification, execute these steps:

1. **Inspect Sources**: View authoritative files before modifying code.
2. **Apply SOLID & KISS**: Ensure single responsibility, clean separation of concerns, and zero duplicate UI elements.
3. **Verify Observables & Error Handling**: Return Observables for async operations, subscribe before state mutation, and catch API errors into red toast notifications.
4. **Remove Dead Code**: Strip all unused imports, dead methods, commented-out lines, and duplicate template actions.
5. **Run Verification**: Execute unit test suite (`npm test -- --watch=false`) to ensure 100% test pass before completion.
