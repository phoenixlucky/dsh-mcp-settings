# MCP Bundle Child Switches Implementation Plan

> **For agentic workers:** Implement this plan task-by-task in `deepseek-harness`. Use the repository's executing-plans workflow. Steps use checkbox syntax for tracking.

**Goal:** Add an independent enable switch for each of the four MCP bundle child rows while keeping the bundle switch as the parent gate.

**Architecture:** The Host resolves a child by the stable pair `(bundleName, rowId)`, persists its desired state with the existing profile patch writer, and applies it through the existing reload path. The Plugins client uses that stable address even when a child has no live Loader entry; runtime phase remains a separate display value. Turning off the bundle removes its patch layer and stops every child; turning it back on restores the saved child choices.

**Tech Stack:** TypeScript, Cordis Loader, Typert remote services, React, Vitest.

**Spec:** Behavioral contract in this plan, confirmed by the user in this conversation.

## Global Constraints

- Keep the bundle-level enable switch as the parent gate; child switches are available only while the bundle is enabled.
- A child switch changes only that row's `disabled` override in the profile patch; it does not change bundle selection.
- Keep the existing whole-bundle uninstall operation. Do not add child uninstall.
- Preserve higher-priority overlays and existing `applied`, `restart-required`, and `overridden` outcomes.
- Keep protected management rows read-only and refuse unknown or ambiguous bundle/row pairs before writing.
- Do not require a live Loader entry to address a declared child row.

## Behavioral contract

The bundle detail page lists four rows: `cognee-memory`, `mcp-chrome`, `mcp-server-manager`, and `ui-settings-mcp`. When the bundle is enabled, each row has its own switch. Disabling a row persists its desired state; re-enabling the bundle later restores the row states saved before the bundle was disabled. Disabling the bundle stops all four rows regardless of their saved child states. The bundle's uninstall action continues to remove the bundle as a whole.

## Review Focus

- A child row with no live Loader entry can still be enabled by `(bundleName, rowId)`.
- Turning off the parent bundle stops all children without erasing their saved row preferences.
- Re-enabling the parent restores each child to its last saved state.
- An unknown bundle, undeclared row, duplicate row, or protected row cannot write the profile patch.
- Startup-only profiles report `restart-required`; HMR and higher-priority overlays keep the existing outcome behavior.

---

### Task 1: Add stable child-row lifecycle management to the Host

**Files:**
- Modify: `deepseek-harness/packages/boot/plugin-manager/src/types.ts`
- Modify: `deepseek-harness/packages/boot/plugin-manager/src/index.ts`
- Test: `deepseek-harness/packages/boot/plugin-manager/tests/manager.spec.ts`
- Update generated Typert host/client artifacts through the repository's normal generator; do not hand-edit generated files.

**Interfaces:**
- Add `setBundleRowEnabled(bundleName: string, rowId: string, enabled: boolean): Promise<ChangeResult>` as a `@Remote` method on `PluginManager`.
- Add desired `enabled` state to `BundleRowInfo`, independent of runtime fiber state; carry a read-only reason for protected rows.

- [ ] Add a failing test proving a declared child without a live Loader entry can be enabled and that its profile `disabled` override is persisted.
- [ ] Add tests proving an unknown/undeclared row, an ambiguous row, and a protected management row are rejected without changing the profile patch.
- [ ] Implement row resolution against exactly one child declared by the named, enabled bundle; validate the final composed row module name before writing.
- [ ] Persist through `writePluginEnabled(profile, rowId, moduleName, enabled)` and reload with the row ID as the required entry when enabling. Keep `setPluginEnabled(entryId, enabled)` unchanged for existing callers.
- [ ] Derive `BundleRowInfo.enabled` from the composed row configuration, not from the existence of a live entry. Return protected metadata for rows the UI must lock.
- [ ] Run `pnpm exec vitest run packages/boot/plugin-manager/tests/manager.spec.ts`; expect the focused lifecycle cases to pass.

### Task 2: Wire the bundle detail switches to stable row addresses

**Files:**
- Modify: `deepseek-harness/packages/client/ui-plugin-manager/src/client/manager-store.ts`
- Modify: `deepseek-harness/packages/client/ui-plugin-manager/src/client/PluginManagerPage.tsx`
- Test: `deepseek-harness/packages/client/ui-plugin-manager/tests/manager-store.client.spec.ts`
- Update generated client remote types through the repository's normal Host Typert generation.

**Interfaces:**
- Change the bundle-row action to `setRowEnabled(bundleName: string, rowId: string, enabled: boolean): void`.
- Build row busy keys from `(bundleName, rowId)`; continue joining phase and display metadata from optional `entryId`.

- [ ] Add a failing store test proving a row without `entryId` calls `setBundleRowEnabled(bundleName, rowId, enabled)` and tracks the existing result notice.
- [ ] Change `packageView` to use `BundleRowInfo.enabled` for the switch and the live plugin only for phase and supplementary read-only metadata.
- [ ] Keep a row switch actionable when `entryId` is absent; lock only Host-protected rows and rows hidden by the disabled parent bundle.
- [ ] Keep busy state keyed by bundle and row so simultaneous rows do not block one another.
- [ ] Run `pnpm exec vitest run packages/client/ui-plugin-manager/tests/manager-store.client.spec.ts`; expect the focused row action cases to pass.

### Task 3: Document the parent/child behavior and verify the combined change

**Files:**
- Modify: `deepseek-harness/packages/boot/plugin-manager/README.md`
- Modify: `deepseek-harness/packages/boot/plugin-manager/README.zh.md`
- Modify: `deepseek-harness/packages/client/ui-plugin-manager/README.md`
- Modify: `deepseek-harness/packages/client/ui-plugin-manager/README.zh.md`

- [ ] Document stable bundle/row addressing, the parent-off behavior, persistence of child choices across parent toggles, and bundle-level uninstall.
- [ ] Run `pnpm typecheck` from the `deepseek-harness` repository root and inspect generated Typert artifacts and `git diff --check`.
- [ ] Confirm the tests cover parent-off then parent-on restoration for mixed child states, including `cognee-memory`, `mcp-chrome`, `mcp-server-manager`, and `ui-settings-mcp`.

## Implementation notes

- The current `dsh-mcp` bundle already declares the four stable IDs in `cordis.patch.yml`; no package manifest change is needed for row addressing.
- `readProfilePatches('dsh', profile)` composes selected bundle patches and profile/home/invocation overlays. Resolve the declared row from this composition and reject ambiguity before writing.
- Use the existing `writePluginEnabled` helper so child overrides remain profile-scoped and do not modify the ordered bundle selection list.
- Do not base desired switch state on `PluginInfo.enabled`: that describes runtime inventory and may be absent for a declared, currently stopped child.
- Parent bundle disablement should continue through the existing bundle selection path. Child preference overrides may remain in the profile patch; without the selected bundle's insertion row they must not load the child.
