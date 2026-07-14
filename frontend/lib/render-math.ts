import katex from "katex";

/** Renders a string containing $inline$ and $$display$$ LaTeX math into
 * an HTML string, safe to use with dangerouslySetInnerHTML. Runs on the
 * server — katex works in Node, so we render math once at request time
 * rather than shipping a client-side rendering pass. Non-math text is
 * still escaped to avoid HTML injection from question content. */
export function renderMathText(text: string): string {
  // Display math first ($$...$$), then inline ($...$) — order matters,
  // since a naive inline-first split would break on the $$ boundaries.
  const segments = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

  return segments
    .map((segment) => {
      if (segment.startsWith("$$") && segment.endsWith("$$")) {
        const expr = segment.slice(2, -2);
        return safeRender(expr, true);
      }
      if (segment.startsWith("$") && segment.endsWith("$")) {
        const expr = segment.slice(1, -1);
        return safeRender(expr, false);
      }
      return escapeHtml(segment);
    })
    .join("");
}

function safeRender(expr: string, displayMode: boolean): string {
  try {
    return katex.renderToString(expr, { throwOnError: false, displayMode });
  } catch {
    // If KaTeX itself throws (rare, malformed input), fall back to
    // showing the raw expression rather than crashing the page.
    return escapeHtml(`$${expr}$`);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}