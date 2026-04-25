import { Marp } from "@marp-team/marp-core";
import { CUSTOM_THEMES } from "@/themes";

/**
 * Renders markdown to a complete HTML document using Marp.
 * Creates a fresh Marp instance per call to prevent CSS contamination between themes.
 */
export function renderMarp(markdown: string, theme: string): string {
  const marp = new Marp({ html: true });

  // Register all custom mark-deck themes
  for (const css of CUSTOM_THEMES) {
    marp.themeSet.add(css);
  }

  // Set the active theme
  const activeMarkdown = `---\nmarp: true\ntheme: ${theme}\n---\n\n${markdown}`;

  const { html, css } = marp.render(activeMarkdown);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #f0f0f0; }
  ${css}
</style>
</head>
<body>
${html}
</body>
</html>`;
}
