# Visual Presets

These files define tone presets for the target project.

Use them as:
- project-owned tone starting points
- a source of non-color tokens such as radius, spacing density, type scale, and shadow depth
- a way to keep the same structure while changing the product mood

Connect them in the consuming app by importing one preset into the app's global theme layer, then mapping the `--hjkit-*` variables to the project's semantic tokens or Tailwind theme extensions.
This repository ships the preset definitions, not the app-specific Tailwind configuration that consumes them.

Rules:
- Keep color values project-owned.
- Treat these files as preset packs, not fixed brand themes.
- Choose one preset per project unless the project explicitly supports multiple moods.
- Use semantic color roles in the app, then map the actual values in the project theme layer.
- Each preset should define body and display fonts, size scale, line height, radius, shadow, spacing density, surface contrast, accent density, and motion scale.

Service direction:
- `calm-pro` → B2B SaaS, trust-led, moderate contrast.
- `sharp-product` → dev tool, productivity, precision-first.
- `editorial` → content brand, narrative, expressive amplitude.
- `utilitarian` → internal ops, admin, high density, low decoration.
- `premium-calm` → premium SaaS, restraint, confidence.

Included presets:
- `calm-pro.css`
- `sharp-product.css`
- `editorial.css`
- `utilitarian.css`
- `premium-calm.css`
