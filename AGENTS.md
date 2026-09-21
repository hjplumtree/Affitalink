# Project UI Rules

## Purpose
Use this template in the target project as the local UI operating guide for Codex.
It should steer new screens, design improvements, and review decisions without
overriding the project's own product logic.

## Process
1. Read `DESIGN_SYSTEM.md` first.
2. Read the project's service category, trust profile, urgency level, and content type from `DESIGN_SYSTEM.md` before doing anything else.
3. Read the project profile and backend as environment, not as a choice.
4. Identify the screen type.
5. Choose the strongest composition family for that screen type before touching components.
6. Write a Pseudo-DOM plan before any code, matching `examples/plan-schema.md`.
7. Define the width, density, contrast budget, focal point, primary action, dominant surface, and supporting surfaces in the plan.
8. Stop here and apply the review filter before proceeding to build.
9. Use the project's existing shadcn/ui and Tailwind stack before writing raw elements.
10. Rebuild structure before polishing if the screen feels weak.
11. Refine spacing, hierarchy, grouping, amplitude, and contrast.

## Project Profile Reading Rules
- Treat service category, trust profile, urgency level, and content type as fixed project context.
- Treat backend as fixed for the project, not per screen.
- Treat the tone preset as fixed unless the project owner changes it.
- Treat allowed families as the design boundary for the project.
- Treat color values as project-owned theme data, not global hjkit defaults.

## Screen priorities
- Dashboard: scannability and information hierarchy first.
- Landing: value proposition and one dominant CTA first.
- Tool: primary action and task completion first.
- Settings: low cognitive load and clear save flow first.
- Landing should usually be asymmetric or editorial, not centered-everything.
- Dashboard should surface one scanable queue plus a secondary exception rail.
- Tool should show the input and the result as distinct surfaces.
- Settings should group by task and keep one save path.

## Stack
- Prefer the project's existing stack.
- Default examples assume shadcn/ui and Tailwind CSS.
- Override these assumptions per project when needed.

## Component Usage
- Before writing any layout code, check `project-template/components/primitives/` first.
- Use `PageShell` as the outermost wrapper for every screen.
- Use `Section`, `Panel`, `Stack`, and `Cluster` before writing raw `div` wrappers.
- Check `project-template/components/recipes/` before inventing a new screen structure.
- `HeroShell`, `ProofRail`, `QueueRail`, `InputResultShell`, `TaskFormShell`, and `SectionStack` are the approved starting points.
- Use `project-template/components/patterns/` before creating a new button, card, callout, or field group.
- Do not write raw `div` wrappers where a primitive or pattern already exists.
- Do not create a new recipe unless none of the existing recipes fits the screen type.
- Do not create a new pattern unless the structure repeats across multiple screens.
- Treat content touching or nearly touching a wrapper edge as a containment failure, not a spacing preference.
- Use Section > Panel > content for large narrative blocks; do not let a single Card act as the section shell.
- Give Section-level breathing room to large blocks instead of relying on `space-y` alone.
- Avoid `padding="sm"` on Panel for content-heavy surfaces.
- If the screen still feels weak after using the available ladder, return to the plan before writing code.

## Required Order
- Service context first.
- Screen type second.
- Tone preset third.
- Composition family fourth.
- Plan fifth.
- Stop here and apply the review filter before proceeding to build.
- Code sixth.
- Review seventh.

## Phase Gate
- Phase 1 ends after the Pseudo-DOM plan is written.
- Phase 2 begins only after one candidate has been selected and the review filter has accepted or explicitly requested a structural rewrite.
- Do not merge Phase 1 and Phase 2 in a single pass.
- If two candidates differ only in color, padding, or other cosmetic details, reject them and redraw the structure.
- If the screen still feels cramped or generic, return to the plan and change the layout rather than polishing the current one.
- If content touches or nearly touches a wrapper edge, do not treat it as a polish issue; redo the section or screen structure.

## Rules
- Avoid generic layouts.
- Avoid default Tailwind look.
- Prefer reusable components.
- Keep hierarchy obvious.
- Use one primary action per screen.
- Keep one clear focal point and one obvious reading path per screen.
- Remove sections that do not earn their space.
- Do not let decorative elements compete with the primary action.
- Default to left-aligned content unless centered layout is clearly justified.
- Prefer asymmetry or modular grouping over evenly repeated cards.
- Prefer one strong recipe over mixing several weak ones.
- Reduce decorative elements before reducing clarity.
- Treat wrapper spacing and panel padding as required, not optional.
- Keep spacing rhythm and radius language consistent within a screen.
- If the screen feels generic, the structure is wrong.
- If the project already has `components/` or `examples/`, use the closest matching local composition as a baseline.
- If the project has `themes/`, use its preset files instead of inventing new tone defaults.
- Do not make backend decisions inside a screen implementation task.

## Read first
- `DESIGN_SYSTEM.md`

## Avoid
- Too many cards.
- Flat empty UI.
- Centered-everything layouts.
- Raw elements where a shadcn/ui component exists.
