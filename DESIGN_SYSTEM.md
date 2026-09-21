# Design System

## Purpose
This file defines the UI contract the target project should follow when Codex
creates or improves screens. It is intentionally opinionated so output stays
consistent, structured, and shipped-looking.

## Design Operating Model
Every screen should be built in this order:
1. Read the project profile and service context.
2. Classify the screen type.
3. Choose the best archetype for that type.
4. Define one focal point and one primary action.
5. Pick a dominant surface and one or two supporting surfaces.
6. Build the shell before the sections.
7. Refine spacing, type, and contrast only after the structure feels right.
8. Do not move from plan to code until one candidate has been selected and the review filter has accepted it.

## Project Profile
Every target project should establish a profile before screen work starts.
- Service category: `ops tool`.
- Trust profile: `high-trust`.
- Urgency level: `medium`.
- Content type: `data-dense`.
- Backend: `mixed`.
- Tone preset: `utilitarian`.
- Allowed families: dashboard queue rail, tool input-result, settings task form.
- Theme values: warm paper surfaces, night navigation, logo purple actions, and functional status colors.
- Override rules: use a wide compact workspace and one primary action per screen.

## Core Principles
- Build UI that feels deliberate, structured, and shipped.
- Prefer structural fixes over cosmetic fixes.
- Avoid generic SaaS patterns.
- Make the screen specific to the product, not just clean.
- If a screen could belong to any product, the structure is wrong.

## Layout Responsibility
- Shell: page width, outer spacing, and background.
- Panel: grouping, surface, border, shadow, and internal padding.
- Content: typography, internal spacing, and hierarchy.
- Content must not touch a wrapper edge unless the layout is intentionally full-bleed.
- Every panel must include internal padding.

## Surface Roles
- Shell surface: the page container and background context.
- Primary surface: the main area that owns the first read.
- Secondary surface: supporting evidence, controls, or explanation.
- Contrast surface: dark, tinted, or otherwise differentiated blocks used sparingly.
- Tension surface: the area that names the problem, blocker, or risk.
- Use surfaces to separate roles, not to decorate every block.

## Typography Scale
- Title: 28-32px, one per page, page heading only.
- Section: 18-20px by default.
- Body: 14-16px, default content.
- Meta: 12-13px, secondary info only.

## Density Adjustments
- Dashboard: Section 16-18px, compact grouping, high scanability.
- Landing: Section 20-24px, more breathing room, stronger visual pause.
- Tool: Section 18-20px, action-focused, medium density.
- Settings: Section 16-18px, lowest cognitive load, form-grouped.

## Layout Amplitude
Layout amplitude defines how wide and open a screen should feel. It is distinct from density.
- narrow: contained width, low visual tension, settings default.
- balanced: default content width, most tool screens.
- wide: expanded content width, clear breathing room, landing and dashboard default.
- fluid: near full-bleed or full-bleed, reserved for hero-led or highly expressive blocks.
- Service context sets the starting amplitude, contrast, and density before screen-type rules are applied.
- Screen type still decides structure. Service context decides the starting tone and force.
- Landing screens should usually default to wide or fluid hero treatment.
- Dashboard screens should usually default to a wide shell with rail structure.
- Tool screens should usually default to balanced width with clear input/result separation.
- Settings screens should usually default to narrow or balanced width.
- If a landing screen feels cramped, check amplitude before adjusting spacing.
- A wide shell with tight content spacing is a composition failure.

## Service Context Defaults
Use the project profile's service context to set the starting values for amplitude, contrast, and density.
Do not compute a new blend at screen time. Use the closest matching row as the project default.

- B2B SaaS, trust-led: amplitude balanced / contrast medium / density compact.
- B2B SaaS, conversion-led: amplitude balanced / contrast high / density compact.
- consumer product: amplitude wide / contrast high / density balanced.
- marketing: amplitude fluid / contrast high / density spacious.
- ops tool: amplitude balanced / contrast medium / density compact.
- editorial: amplitude wide / contrast medium / density spacious.
- admin: amplitude narrow / contrast low / density compact.

Rules:
- Service context sets the starting values.
- Screen type rules override only when the screen has a clear structural reason.
- High urgency projects should keep the primary action visibly dominant.
- High-trust projects should avoid overstated contrast unless the screen needs it.

## Visual Presets
Visual presets control the non-color tone of the system.
- A preset should define a small but explicit token pack.
- Typical tokens include: font body, font display, size scale, line height, radius base, radius card, shadow card, shadow elevated, shell spacing, section spacing, card spacing, spacing density, surface contrast, accent density, motion scale, motion duration, and motion easing.
- Typography tone: body font, size scale, and line height.
- Radius profile: sharp, balanced, or soft rounding.
- Shadow depth: subtle, calm, or elevated treatment.
- Surface contrast: how strong the step between surfaces should feel.
- Accent density: how often emphasis may appear in one screen.
- Motion feel: minimal, standard, or expressive motion.
- Color roles stay semantic, but theme values are project-owned.
- The consuming app must map these preset tokens into its own global theme layer, Tailwind extensions, or semantic CSS variables.
- Hjkit ships the preset definitions, not the app-specific token wiring that consumes them.

## Contrast Budget
Contrast budget defines how much visual emphasis each role should receive on a screen.
- High: the primary action must visibly win and the main surface must clearly lead.
- Medium: the hierarchy should be clear without every block shouting.
- Low: the layout should stay quiet and restrained, usually for settings or recovery states.
- Primary action should always have the highest contrast on the screen.
- Secondary actions should support, not compete with, the primary action.
- Card depth should be visibly different from shell depth.
- Proof surfaces should usually sit at lower contrast than the main read.
- Tension surfaces may be stronger, but only when the screen needs blocker or risk visibility.
- If a primary button blends into its surrounding surface, the contrast budget is too low.
- If secondary actions match the primary action in visual weight, the contrast budget is too high or poorly assigned.
- If every surface feels equally strong, the screen is over-budgeted.

## Composition Families
Each screen type should choose from a small set of approved families.

### Landing
- Use an asymmetric editorial or product-led hero unless the product truly needs a centered hero.
- Pair the hero with one proof area and one tension or differentiation area.
- Keep one dominant CTA above the fold.
- Avoid stacking multiple equal-weight feature cards.

### Dashboard
- Lead with a summary rail or queue that can be scanned in one pass.
- Put the most urgent work in the strongest surface.
- Use a side rail for exceptions, blockers, or short-lived alerts.
- Keep metrics compact and immediately actionable.

### Tool
- Put the main action first.
- Keep the input and result surfaces clearly separated.
- Show loading, empty, and error states as first-class parts of the flow.
- Avoid decorative extras that slow down task completion.

### Settings
- Group controls by task, not by component type.
- Keep the save path obvious and singular.
- Use the lowest noise layout that still makes validation and recovery easy.
- Default to one column unless a two-column split improves scanning.

## High-Level Recipe Components
These are the reusable structural recipes that can be promoted later if they recur.
- Hero shell: a landing header with a single dominant focal point and one CTA.
- Proof rail: a supporting surface for trust signals, stats, or proof blocks.
- Queue rail: a dashboard rail for scanable work, blockers, or exceptions.
- Input-result shell: a tool layout that keeps entry and output visually separate.
- Task form shell: a settings layout that groups fields and keeps one save path.
- Section stack: a narrative layout that uses ordered sections to tell the story.
- Section stack: a narrative layout that uses ordered sections to tell the story; the measure should be controlled by the caller, not hard-coded to one width.
- Promote these only after a pattern appears in multiple real screens.

## Component Ladder
Use the smallest component that can express the job clearly.
1. Primitives first: `PageShell`, `Section`, `Panel`, `Stack`, `Cluster`.
2. Patterns next: `PrimaryButton`, `SecondaryButton`, `Card`, `Badge`, `Callout`, `FieldGroup`, `Toolbar`, `DataList`.
3. Recipes next: `HeroShell`, `ProofRail`, `QueueRail`, `InputResultShell`, `TaskFormShell`, `SectionStack`.
4. Screen composition next: landing, dashboard, tool, or settings layouts.
5. Project-local overrides last, only when the existing ladder cannot express the structure cleanly.

Rules:
- Do not use a raw wrapper when a primitive already solves the layout role.
- Do not create a new recipe unless an existing recipe clearly fails the screen type.
- Do not create a new pattern unless the same pattern appears across multiple screens.
- Promote upward only after repetition is visible in real screens.
- Use Section-level breathing room for large narrative blocks; `space-y` alone is not section separation.
- Do not use a single Card as the outer shell for a large narrative section when Section > Panel > content is available.

## Component Promotion Rules
Promote a pattern from project-local to `hjkit` only when:
1. It appears in two or more different screens without modification.
2. It cannot be expressed by composing existing primitives and recipes.
3. It is service-agnostic and would work in any project using `hjkit`.
4. `ui-review` has requested the same pattern more than once.

Do not promote:
- Service-specific components such as `AffiliateCard` or `CouponBadge`.
- One-off layouts that will not repeat.
- Cosmetic wrappers that only change padding, radius, or color.

## Plan Schema
Plans must be written as structured text, not prose.
- Use a pseudo-DOM tree or nested outline.
- Name the candidate and the family at the top.
- Show layout, width, density, contrast budget, focal point, primary action, and surface roles explicitly.
- Show supporting blocks and state coverage.
- Include no-go notes when a candidate should be rejected.
- Use `examples/plan-schema.md` as the canonical format reference.
- If the plan cannot be read as a tree at a glance, rewrite it before coding.
- The plan should make it possible to reject a candidate without opening the code.
- Keep one candidate per tree.

Recommended plan shape:

```text
[Candidate A: Family Name]
├─ Layout: ...
├─ Width: narrow / balanced / wide / fluid
├─ Density: compact / balanced / spacious
├─ Contrast Budget: low / medium / high
├─ Surface: Primary / Secondary / Contrast / Tension
├─ Focal Point: ...
├─ Primary Action: ...
├─ Supporting Blocks:
│  ├─ ...
│  └─ ...
├─ States:
│  ├─ Empty: ...
│  ├─ Loading: ...
│  └─ Error: ...
└─ No-Go Notes: ...
```

See [`examples/plan-schema.md`](./examples/plan-schema.md) for concrete examples of landing, dashboard, tool, and settings candidates.

## Spacing Scale
- 4 / 8 / 12 / 16 / 24 / 32 / 48
- Use values from this scale unless a project-specific override is documented.

## Color Tokens
- background
- surface
- surface-offset
- text
- text-muted
- text-faint
- primary
- primary-hover
- border
- divider
- error
- success
- warning

## State Coverage
- Dashboard: default scanable state, empty state, loading state, error state.
- Landing: sparse fallback, proof fallback, CTA fallback.
- Tool: empty, loading, error, and result states.
- Settings: saved state, unsaved state, validation errors, recovery path.

## Component States
- Interactive components should define: default, hover, active, disabled, loading.
- State-heavy components should also define: empty, error.

## Code Primitives
- Use these before writing raw elements:
- PageShell
- Section
- Panel
- Stack
- Cluster
- PrimaryButton
- SecondaryButton
- Card
- EmptyState
- LoadingState
- ErrorState
- FieldGroup
- Badge
- Callout
- Toolbar

## Failure States
- Content touching a wrapper edge is a layout failure.
- A panel without internal padding is a layout failure.
- Multiple equal-weight primary actions are a hierarchy failure.
- A generic 3-card grid without structural justification is a failure.
- Cramped content with correct alignment is a spacing failure.
- A section title with no vertical breathing room is a containment failure.
- A large narrative block that relies on a single Card slab is a containment failure.
- A generic feel on a product-specific screen is a structural failure.
- Competing focal points are a composition failure.
- Orphaned labels, buttons, or cards are a layout failure.
- Mixed spacing or radius systems in one screen are a consistency failure.
- Sections that do not earn their space are a structure failure.
- A hidden primary action is a hierarchy failure.
- A screen with no dominant surface is a structure failure.
- A screen that feels interchangeable across products is a positioning failure.
- Repeating the same card shape at equal weight without a reason is a composition failure.
- A centered landing page with no structural contrast is a landing failure.

## Non-Negotiables
- No content block may touch a wrapper edge unless full-bleed is intentional.
- No panel may be missing internal padding.
- No large narrative block may rely on `space-y` alone for section separation.
- No section title may sit directly on the wrapper edge without section-level breathing room.
- No screen may have more than one primary action.
- No screen may have more than one focal point.
- No screen may lack one obvious reading path.
  - The eye should move top-to-bottom or in a clear Z-pattern without confusion.
  - No two elements should compete for equal attention at the same level.
  - Section transitions should feel intentional, not accidental.
- No screen may contain orphaned labels, buttons, or cards.
- No screen may mix spacing rhythms or radius languages without intent.
- No section may exist without a clear reason.
- Every section must earn its space.
  - It introduces new information not present elsewhere.
  - It contains the primary or secondary action.
  - Removing it would make the screen harder to understand.
- Primary action must be visible in the first read.
- If the screen feels generic, fix the structure first.
- Every interactive component must handle required states.
- Use asymmetry when it improves hierarchy.
- Use repeated cards only when repetition itself is the point.
- Use color to clarify roles, not to give every block attention.
- Prefer one strong recipe over blending multiple weak ones.

## Quality Bar
- The first read should make the purpose obvious.
- The eye should have one clear path.
- The main action should be easy to find without searching.
- The shell should feel wide enough for the screen type.
- The primary action should visibly win against the surrounding surface.
- Secondary actions should not compete with the primary action.
- Card depth should be clearly different from shell depth.
- Density should match the screen type instead of defaulting to a single rhythm.
- The service context should be visible in the tone and force of the screen.
- The design should still feel specific if the copy is replaced with another product.
- If the result looks tidy but generic, the structure needs another pass.
