# Design System

## Project profile

- Service: high-trust affiliate operations tool
- Urgency: medium
- Content: data-dense
- Backend: mixed browser and Supabase workspaces
- Tone: compact, utilitarian, calm
- Product flow: `Networks (connection and advertiser selection) -> Links`
- Theme source: `styles/globals.css` and `tailwind.config.cjs`

Treat this profile as fixed unless the product owner changes it.

## Screen workflow

Before code, write one pseudo-DOM candidate containing:

```text
[Screen: composition]
|- Width: narrow / balanced / wide
|- Density: compact / balanced
|- Contrast: low / medium / high
|- Focal point: ...
|- Primary action: ...
|- Primary surface: ...
|- Supporting surfaces: ...
`- States: loading / empty / error / success
```

Review the candidate before building. Change the structure when the reading
path, containment, or primary action is weak; do not try to repair those
problems with color or decoration.

## Screen priorities

- Dashboard: one scannable summary, one clear next action, compact metrics.
- Networks: connection status and setup path first.
- Network settings: one column, connection form first; connected networks show advertiser search and selection directly below the form. No separate Advertisers tab.
- Links: date/network input and saved results as distinct surfaces; show 50 rows per page. Search and CSV apply to all matching results. Put the Checked checkbox and its saved time together in the first column; show check errors in that row and collection results below Get links.
- Login: low cognitive load and an obvious guest path.

Use one focal point and one primary action per screen. Supporting actions must
not compete with them.

## Existing component inventory

Use the smallest existing component that fits:

- Layout: `PageShell`, `Section`, `Panel`, `Stack`, `Cluster`, `PageHeader`
- Controls: `Button`, `Input`
- App shells: `Layouts`, `Navigator`, `PublicShell`
- Feedback: `Loading` and inline error/success messages

`PageShell` is the default for dashboard screens. The login page intentionally
uses `PublicShell` directly. Add a shared component only after the same
structure appears on multiple screens.

## Layout and style

- Dashboard and data tools use wide, compact layouts.
- Settings use a balanced or narrow layout with one save/connect path.
- Panels own grouping, border, shadow, and internal padding.
- Content must not touch a wrapper edge unless it is intentionally full-bleed.
- Use the spacing scale: 4, 8, 12, 16, 24, 32, 48.
- Use semantic theme tokens; do not introduce a second token or theme system.
- Prefer left alignment, asymmetric emphasis, and clear hierarchy.
- Avoid equal-weight card grids unless repetition is the information.
- Do not use eyebrows above titles or add storage explanations to product screens.
- Use direct, familiar labels. Call collected benefits Links throughout the UI.
- Remove unnecessary text. Necessary text uses the title's foreground color, not gray or reduced-opacity text. Use size, weight, and spacing for hierarchy.

## Required states

- Data screens: loading, empty, error, and populated states.
- Forms: validation, submitting, success, and recovery states.
- Interactive controls: default, hover, focus, disabled, and loading when needed.

## Review bar

A screen is not ready when:

- its purpose or next action is unclear on first read;
- more than one element claims primary emphasis;
- a panel lacks padding or sections run together;
- repeated surfaces have no information reason;
- a new abstraction duplicates an existing primitive;
- decorative UI slows the core flow.

Fix structure first, then spacing, typography, and contrast.
