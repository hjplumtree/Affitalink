# Migration Plan

This repo is running on an older frontend base:

- Next.js `12.1.1`
- React `17.0.2`
- Chakra UI `1.x`
- npm lockfile only

That stack still works, but it is behind the current React and Next ecosystem by multiple major versions. The right move is not a single rewrite. It is a staged migration that reduces risk while keeping the app shippable.

## Goals

- Modernize the runtime and framework baseline
- Move package management to `pnpm`
- Keep the app working during the upgrade
- Leave room to replace Chakra with `shadcn/ui + Tailwind`
- Avoid mixing framework upgrades with major visual rewrites in the same step

## Current Recommendation

- Package manager: `pnpm`
- Runtime target: Node `20.x`
- Framework target: Next `16`, React `19`
- UI direction: `shadcn/ui + Tailwind`, migrated page-by-page after the framework baseline is stable

## Phase 1: Runtime And Framework Baseline

Objective: make the repo predictable and ready for the bigger upgrade work.

### Scope

1. Pin the runtime
- Add `.nvmrc`
- Add `engines` to `package.json`

2. Standardize package management
- Add `packageManager` to `package.json`
- Generate a `pnpm-lock.yaml`
- Validate local workflows with `pnpm test` and `pnpm build`

3. Upgrade prep
- Keep `pages/` router for now
- Do not mix App Router migration into this phase
- Keep Chakra in place for this phase

### Exit Criteria

- Runtime is explicit
- `pnpm` is the default package manager
- Build and test still pass
- Repo is ready for the first framework upgrade slice

## Phase 2: Next And React Upgrade

Objective: move the app from Next `12` / React `17` to a current supported baseline.

### Scope

- Upgrade `next`
- Upgrade `react` and `react-dom`
- Upgrade `eslint-config-next` and `eslint`
- Resolve any breaking changes in router, Head usage, lint rules, and SSR behavior

### Notes

- Do not switch UI libraries in this phase
- Keep route structure stable
- Expect some compatibility fixes around old Next behavior and strict mode

## Phase 3: Tailwind And shadcn/ui Foundation

Objective: create a new UI foundation while the existing app still runs.

### Scope

- Install Tailwind
- Initialize `shadcn/ui`
- Define shared tokens:
  - colors
  - spacing
  - radii
  - typography
- Introduce shared primitives:
  - button
  - input
  - badge
  - panel
  - dialog

### Notes

- Chakra and shadcn/Tailwind will temporarily coexist
- This is intentional and safer than a one-shot rewrite

## Phase 4: Page-By-Page UI Migration

Recommended order:

1. `/login`
- Smallest and most isolated page

2. `/offers`
- Product-defining screen
- Good place to shape the new dense data UI

3. `/links`
- Operational split-pane workflow
- Heavier interaction density

4. `/networks`
- Configuration forms and advertiser selection

## Phase 5: Chakra Removal

Objective: remove the old styling system only after the new one has fully replaced it.

### Scope

- Remove Chakra imports from all pages/components
- Remove `ChakraProvider`
- Remove old theme file or replace it with tokens only
- Remove unused dependencies:
  - `@chakra-ui/react`
  - `@emotion/react`
  - `@emotion/styled`
  - `framer-motion` if no longer needed

## Non-Goals For Now

- Full App Router migration
- Server Components rewrite
- Bun runtime migration

Those may be worth revisiting later, but they would increase migration risk right now.

## Immediate Next Steps

1. Land the Phase 1 runtime and `pnpm` baseline
2. Start the first verified Next/React upgrade slice
3. Only then decide the exact Tailwind and `shadcn/ui` rollout sequence
