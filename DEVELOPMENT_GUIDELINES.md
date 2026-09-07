# Development Guidelines & Coding Standards

This document establishes the design principles and coding practices that MUST be complied with at all times during the development of the RN Tailor application.

---

## 1. Core Principles
- **KISS (Keep It Simple, Stupid)**: Write simple, direct, readable code. Avoid over-engineering, unnecessary abstractions, or overly complex designs.
- **SOLID Principles**:
  - **S**ingle Responsibility: Each class, controller, service, or component should have only one reason to change.
  - **O**pen/Closed: Entities should be open for extension but closed for modification.
  - **L**iskov Substitution: Subtypes must be substitutable for their base types.
  - **I**nterface Segregation: Prefer specific, narrow interfaces over large, fat ones.
  - **D**ependency Inversion: Program to interfaces. Dependencies must be injected (prefer constructor injection in Spring Boot; field injection with `@Autowired` is prohibited).
- **Separation of Concerns**: Separate business logic (services), database access (DAOs), and HTTP endpoints (controllers). In the UI, keep data logic (storage services), display templates (HTML), and route logic (components) decoupled.
- **DRY (Don't Repeat Yourself)**: Avoid duplicate markup or logic. Refactor repetitive code blocks into shared components, helper methods, or global utility classes.

---

## 2. Java Service & Controller Layer Standards
- **Constructor Injection**: All controllers and services must inject dependencies explicitly through their constructors.
- **Service Interfaces**: Always expose service logic through Java interfaces, with concrete implementations placed in the `impl` subpackage.
- **DTOs vs Models**: Always use Data Transfer Objects (DTOs) for HTTP request and response payloads. Do not serialize entity models or raw database entities directly.
- **Dead Code Cleanup**: Regularly audit and remove unused imports, dead methods, commented-out code, and obsolete legacy classes.

---

## 3. UI & Design System Guidelines
- **Responsive Layouts**: Design for mobile, tablet, and desktop views dynamically using Tailwind CSS layout utilities.
- **Scroll-Lock Patterns**: Keep the viewport layout container locked to `overflow-hidden` so that search bars, action rows, and table headers stay permanently fixed. Scrolling must be strictly confined to table rows (`tbody` inside `overflow-y-auto`).
- **Typography & Consistency**:
  - Table headers and section labels: `text-xs font-semibold text-slate-500 uppercase tracking-wider`
  - Body text and table content: `text-sm font-medium text-slate-900`
  - Secondary text / mobile numbers / metadata: `text-xs text-slate-500`
- **Zero Inline Important CSS**: Always avoid using the `!important` flag. Style boundaries using Tailwind utility classes or custom selector classes in `styles.css`.
- **Search & Filter Inputs**: Align search inputs on the left side of top action bars and primary buttons on the right side. Search inputs must use `.form-input-search` (which enforces `padding-left: 2.5rem`) to guarantee search icons never overlap text.
