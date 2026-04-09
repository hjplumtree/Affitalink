# Project UI Rules

## Purpose
Use this template in the target project as the local UI operating guide for Codex.
It should steer new screens, design improvements, and review decisions without
overriding the project's own product logic.

## Process
1. Read `DESIGN_SYSTEM.md` first.
2. Identify the screen type.
3. Use the project's existing shadcn/ui and Tailwind stack before writing raw elements.
4. Rebuild structure before polishing if the screen feels weak.
5. Refine spacing, hierarchy, and grouping.

## Screen priorities
- Dashboard: scannability and information hierarchy first.
- Landing: value proposition and one dominant CTA first.
- Tool: primary action and task completion first.
- Settings: low cognitive load and clear save flow first.

## Stack
- Prefer the project's existing stack.
- Default examples assume shadcn/ui and Tailwind CSS.
- Override these assumptions per project when needed.

## Rules
- Avoid generic layouts.
- Avoid default Tailwind look.
- Prefer reusable components.
- Keep hierarchy obvious.
- Use one primary action per screen.
- Default to left-aligned content unless centered layout is clearly justified.
- Prefer asymmetry or modular grouping over evenly repeated cards.
- Reduce decorative elements before reducing clarity.
- Treat wrapper spacing and panel padding as required, not optional.
- If the screen feels generic, the structure is wrong.
- If the project already has `components/` or `examples/`, use the closest matching local composition as a baseline.

## Read first
- `DESIGN_SYSTEM.md`

## Avoid
- Too many cards.
- Flat empty UI.
- Centered-everything layouts.
- Raw elements where a shadcn/ui component exists.
