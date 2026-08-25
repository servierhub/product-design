# Comparable journeys from full-size screen sets

Define exactly three journeys and their ordered 3–6 screen plans against one frozen comparison contract. Generate every screen as an independent full-size image. Run the three variants in parallel when isolated workers are available, while keeping screens sequential inside each variant. Use distinct output directories and assemble results deterministically as V1, V2, V3 after all workers finish. For desktop web, prefer 1536 × 1024 where supported and use 1024 × 768 as fallback. Preserve shell and data continuity inside each variant.

Never ask Image Gen for a sprite sheet, contact sheet, storyboard, miniature grid or N columns. Separate screen files are the visual source of truth.

After all images exist, create exactly one board page per variant using the original files. Prefer the requested collaborative board tool, then Figma/FigJam/Miro equivalent, then the bundled dependency-free `scripts/build-journey-board.mjs` HTML generator. Preview its output through `scripts/serve-journey-board.mjs` and an available browser; do not claim a native Goose Desktop viewer unless exposed. Use a wide scrollable or spacious wrapped canvas with numbers, IDs and connectors. Preserve aspect ratios and do not squeeze screens into equal narrow columns.

Show all three pages and full-size access to their images. After selection, verify and request approval of the selected existing set; do not regenerate it merely because it was selected. Build resolves individual approved files, never only a board screenshot.

For a true single-screen target, generate three directions for the same screen and viewport.
