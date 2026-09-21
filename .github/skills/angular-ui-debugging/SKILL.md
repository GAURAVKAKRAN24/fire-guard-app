---
name: angular-ui-debugging
description: "Use when debugging Angular UI issues, wiring pages to APIs, fixing route/layout behavior, validating component contracts, or implementing a feature in this fire-safety dashboard app."
---

# Angular UI Debugging and Feature Workflow

## Purpose

Use this skill when the task involves Angular components, routes, services, forms, or dashboard pages in this workspace. The goal is to fix the actual issue with the smallest safe change and verify it with the project’s real Angular tooling.

## Workflow

### 1. Identify the affected layer

Start by locating the exact feature area before changing code.

- Check whether the issue is in a route, layout, page component, or service contract.
- Confirm the file path and symbols involved before editing.
- Prefer the smallest relevant file set instead of broad refactors.

Typical starting points in this repo:
- App shell and layout: `src/app/app.ts`, `src/app/app.html`, `src/app/app.routes.ts`
- Pages: `src/app/pages/**`
- Services and models: `src/app/core/services/**`, `src/app/core/models/**`
- Styling: `*.scss` paired with the same feature component

### 2. Trace the data flow

For logic bugs or broken UI, trace the input from the route to the rendered output.

- Confirm the route is registered and the component is reachable.
- Verify the component imports and standalone configuration are correct.
- Check service URLs, models, and response shapes against the API contract.
- Confirm the template binds to the correct property names and avoids stale state.

Decision points:
- If the page does not render, inspect route registration and component imports.
- If data is missing, inspect the service call and model/interface contract.
- If the UI is visually broken, inspect the paired HTML and SCSS together.
- If the form is not behaving, inspect the reactive form setup and button handlers.

### 3. Reproduce and isolate the root cause

Before fixing, verify what breaks and why.

- Run the most relevant Angular check, such as a focused test or the app itself.
- Look for concrete errors in the browser console or Angular compile output.
- Prefer one failing signal over guessing across multiple files.

Good root-cause checks:
- Missing route path or incorrect component import
- Wrong property names between service data and template usage
- Broken `@Input`/`@Output` wiring or event handlers
- API response mismatch with the TypeScript model
- CSS/layout state issues caused by mobile or sidebar behavior

### 4. Apply the minimal root-cause fix

Make the smallest change that addresses the actual cause.

- Keep edits local to the affected component, service, model, or route.
- Avoid speculative cleanup while debugging the issue.
- Preserve the existing architecture and naming conventions of the app.

### 5. Verify with real project evidence

After the fix, prove the behavior with the repo’s actual tooling.

Recommended checks:
- `npm test -- --watch=false --browsers=ChromeHeadless` for unit tests if relevant
- `npm run build` for compile verification
- `npm start` if the issue is visual or runtime behavior

Do not stop at a code change alone. A fix is not complete until the relevant verification passes or the remaining limitations are clearly documented.

### 6. Final quality gate

Before finishing, confirm:

- The bug or feature is fixed in the affected area
- The component still matches the route and page structure
- No unrelated files were changed unnecessarily
- The result is consistent with the repo’s Angular patterns
- Evidence was checked with a real command or runtime validation

## Decision Tree

### Route or UI issue?
- Check app routes and template links first.
- Confirm the component is loaded and the selector is used correctly.

### API or data issue?
- Inspect the service call, environment URL, and TypeScript model.
- Compare returned fields to the expected interface and template usage.

### Form or interaction issue?
- Verify form group setup, validators, event binding, and save/cancel logic.
- Confirm the submit flow matches the intended UI behavior.

### Styling/layout issue?
- Compare the feature’s HTML/SCSS together.
- Check responsive breakpoints and layout containers before adding random CSS.

## Completion Checklist

A task is complete only if all of the following are true:

- [ ] The root cause is identified and explained
- [ ] The fix is minimal and targeted
- [ ] Related files were checked for contract alignment
- [ ] Real validation was run in the workspace
- [ ] The changed behavior matches the requested outcome

## Example prompts

- "Fix the sidebar toggle so it closes correctly from mobile navigation."
- "Trace why the dashboard summary is not rendering and repair the data binding."
- "Add the missing customer route behavior and verify the form flow works."
- "Diagnose the Angular compile error in the page/service integration and fix it."
- "Review this feature for the correct route, service, and template contract before implementing it."

## Related customizations to create next

- A project-specific prompt for Angular route and page implementation
- A skill for testing and regression checks in this Angular workspace
- An instruction file for frontend conventions, naming, and service-model alignment
- A skill for UI polish and responsive layout validation
