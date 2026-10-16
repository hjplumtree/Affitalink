# Project UI Rules

Use these rules only for UI work. Read `DESIGN_SYSTEM.md` before changing a
screen; it is the single source for the project profile, workflow, component
inventory, and review bar.

## Working rules

1. Treat the product flow and backend as fixed context.
2. Classify the screen, then write one pseudo-DOM candidate before coding.
3. Name its width, density, contrast, focal point, primary action, and surfaces.
4. Reject the candidate if its structure is generic, cramped, or unclear.
5. Build with the existing primitives and UI components before adding another.
6. Prefer removing or restructuring weak UI over decorating it.
7. Verify loading, empty, error, and success states that apply to the screen.

Do not create a shared component until the same structure repeats. Do not make
backend or product-scope decisions inside a screen implementation.
