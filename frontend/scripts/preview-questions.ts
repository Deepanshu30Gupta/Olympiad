/**
 * Renders a seed JSON file as a browsable HTML preview — no database
 * needed. Use this to visually check AI-generated question content
 * (math rendering, diagrams, options, hints, solutions) BEFORE seeding it.
 *
 * Usage:
 *   npx tsx scripts/preview-questions.ts prisma/data/ioqm-2025.json
 *
 * Then open the generated preview.html file in your browser.
 */

import fs from "node:fs";
import path from "node:path";

interface SeedQuestion {
  externalId: string;
  problemNumber: number;
  statement: string;
  answerType: "NUMERIC" | "MCQ" | "PROOF";
  options: Record<string, string> | null;
  correctAnswer: string;
  baseRating: number;
  difficultyLabel: string | null;
  tags: string[];
  topics: string[];
  diagramSvg: string | null;
  solutionMarkdown: string;
  estimatedSolveSeconds: number | null;
  examType: string | null;
  hints: { level: number; content: string }[];
}

interface SeedFile {
  contestSource: string;
  contestYear: number;
  examType?: string;
  questions: SeedQuestion[];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderQuestion(q: SeedQuestion, contestLabel: string): string {
  const optionsHtml =
    q.answerType === "MCQ" && q.options
      ? `<div class="options">
          ${Object.entries(q.options)
            .map(
              ([key, val]) => `
            <div class="option ${key === q.correctAnswer ? "correct" : ""}">
              <strong>${key}.</strong> ${escapeHtml(val)}
              ${key === q.correctAnswer ? '<span class="badge">✓ correct</span>' : ""}
            </div>`
            )
            .join("")}
        </div>`
      : q.answerType === "NUMERIC"
        ? `<div class="answer-box">Answer: <strong>${escapeHtml(q.correctAnswer)}</strong></div>`
        : `<div class="answer-box">Self-graded (proof) — reference solution below</div>`;

  const hintsHtml = (q.hints ?? [])
    .map(
      (h) => `
    <details class="hint">
      <summary>Hint ${h.level}</summary>
      <div>${escapeHtml(h.content)}</div>
    </details>`
    )
    .join("");

  return `
  <div class="question-card">
    <div class="meta">
      <span class="pill">${escapeHtml(q.externalId)}</span>
      <span class="pill">${escapeHtml(q.examType ?? "?")}</span>
      <span class="pill">Problem ${q.problemNumber}</span>
      <span class="pill">${escapeHtml(q.difficultyLabel ?? "?")} · rating ${q.baseRating}</span>
      <span class="pill">${escapeHtml(q.answerType)}</span>
      <span class="pill">~${Math.round((q.estimatedSolveSeconds ?? 0) / 60)} min</span>
    </div>
    <div class="topics">Topics: ${(q.topics ?? []).map((t) => `<code>${t}</code>`).join(" ")}</div>
    <div class="statement">${escapeHtml(q.statement)}</div>
    ${q.diagramSvg ? `<div class="diagram">${q.diagramSvg}</div>` : ""}
    ${optionsHtml}
    <details class="solution">
      <summary>Show Solution</summary>
      <div class="solution-source">${escapeHtml(contestLabel)}</div>
      <div class="markdown-body" data-markdown="${encodeURIComponent(q.solutionMarkdown)}"></div>
    </details>
    ${hintsHtml ? `<div class="hints-section"><strong>Hints:</strong>${hintsHtml}</div>` : ""}
  </div>`;
}

function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/preview-questions.ts <path-to-seed-file.json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
  const data: SeedFile = JSON.parse(raw);

  const contestLabel = `${data.contestSource} (${data.contestYear})`;
  const cardsHtml = data.questions
    .map((q) => renderQuestion(q, contestLabel))
    .join("\n");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Question Preview — ${escapeHtml(contestLabel)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
<style>
  body { font-family: -apple-system, Segoe UI, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; background: #fafafa; color: #1a1a1a; }
  h1 { font-size: 20px; }
  .question-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
  .meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
  .pill { background: #eef2ff; color: #3730a3; font-size: 12px; padding: 3px 8px; border-radius: 12px; }
  .topics { font-size: 12px; color: #666; margin-bottom: 12px; }
  .topics code { background: #f1f1f1; padding: 1px 5px; border-radius: 4px; }
  .statement { font-size: 15px; line-height: 1.6; margin-bottom: 12px; white-space: pre-wrap; }
  .diagram { margin: 12px 0; text-align: center; }
  .diagram svg { max-width: 100%; height: auto; border: 1px solid #eee; }
  .options { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
  .option { padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 6px; }
  .option.correct { background: #f0fdf4; border-color: #86efac; }
  .badge { float: right; color: #16a34a; font-size: 12px; }
  .answer-box { background: #f9fafb; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; }
  .solution { margin-top: 12px; border-top: 1px solid #eee; padding-top: 12px; }
  .solution summary { cursor: pointer; font-weight: 600; color: #4338ca; }
  .solution-source { font-size: 12px; color: #999; margin: 6px 0; }
  .markdown-body { font-size: 14px; line-height: 1.6; margin-top: 8px; }
  .hints-section { margin-top: 12px; font-size: 14px; }
  .hint { margin: 6px 0; padding: 6px 10px; background: #fffbeb; border-radius: 6px; }
  .hint summary { cursor: pointer; color: #92400e; font-size: 13px; }
</style>
</head>
<body>
<h1>${escapeHtml(contestLabel)} — ${data.questions.length} questions</h1>
${cardsHtml}
<script>
  document.querySelectorAll('.markdown-body').forEach(el => {
    const md = decodeURIComponent(el.getAttribute('data-markdown'));
    el.innerHTML = marked.parse(md);
  });
  renderMathInElement(document.body, {
    delimiters: [
      {left: "$$", right: "$$", display: true},
      {left: "$", right: "$", display: false}
    ],
    throwOnError: false
  });
</script>
</body>
</html>`;

  const outPath = path.resolve("preview.html");
  fs.writeFileSync(outPath, html);
  console.log(`Preview generated: ${outPath}`);
  console.log(`Open it in your browser to check rendering.`);
}

main();