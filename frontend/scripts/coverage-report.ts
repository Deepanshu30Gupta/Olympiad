/**
 * Coverage report: reads every seed JSON file in prisma/data/ and reports
 * how questions are distributed across exam type, topic, and difficulty —
 * so you can spot thin coverage BEFORE a student hits a dead end, not
 * after. Reads only the JSON files, no database connection needed.
 *
 * Usage:
 *   npx tsx scripts/coverage-report.ts
 */

import fs from "node:fs";
import path from "node:path";

interface SeedQuestion {
  externalId: string;
  difficultyLabel: string | null;
  topics: string[];
  examType: string | null;
}

interface SeedFile {
  contestSource: string;
  questions: SeedQuestion[];
}

const DATA_DIR = path.resolve("prisma/data");
const THIN_THRESHOLD = 3; // flag any topic x difficulty cell below this

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`No prisma/data/ folder found at ${DATA_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.error("No .json files found in prisma/data/");
    process.exit(1);
  }

  const allQuestions: SeedQuestion[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    const data: SeedFile = JSON.parse(raw);
    allQuestions.push(...data.questions);
  }

  console.log(`\nRead ${files.length} file(s), ${allQuestions.length} total questions.\n`);

  // --- By exam type ---
  const byExam: Record<string, number> = {};
  for (const q of allQuestions) {
    const key = q.examType ?? "(none)";
    byExam[key] = (byExam[key] ?? 0) + 1;
  }
  console.log("=== By Exam Type ===");
  console.table(byExam);

  // --- By difficulty ---
  const byDifficulty: Record<string, number> = {};
  for (const q of allQuestions) {
    const key = q.difficultyLabel ?? "(none)";
    byDifficulty[key] = (byDifficulty[key] ?? 0) + 1;
  }
  console.log("=== By Difficulty ===");
  console.table(byDifficulty);

  // --- Topic x Difficulty matrix ---
  const matrix: Record<string, Record<string, number>> = {};
  for (const q of allQuestions) {
    const diff = q.difficultyLabel ?? "(none)";
    for (const topic of q.topics) {
      if (!matrix[topic]) matrix[topic] = {};
      matrix[topic][diff] = (matrix[topic][diff] ?? 0) + 1;
    }
  }
  console.log("=== Topic x Difficulty ===");
  console.table(matrix);

  // --- Flag thin coverage ---
  console.log(`=== Thin coverage warnings (< ${THIN_THRESHOLD} questions) ===`);
  let warnings = 0;
  const allDifficulties = ["Easy", "Medium", "Hard"];
  for (const topic of Object.keys(matrix).sort()) {
    for (const diff of allDifficulties) {
      const count = matrix[topic][diff] ?? 0;
      if (count < THIN_THRESHOLD) {
        console.log(`  ⚠ ${topic} × ${diff}: only ${count} question(s)`);
        warnings++;
      }
    }
  }
  if (warnings === 0) {
    console.log("  None — every topic/difficulty combination has healthy coverage.");
  } else {
    console.log(`\n  ${warnings} thin spot(s) found. Consider prioritizing these before launch.`);
  }

  // --- Questions with no topics at all (data quality check) ---
  const untagged = allQuestions.filter((q) => q.topics.length === 0);
  if (untagged.length > 0) {
    console.log(`\n⚠ ${untagged.length} question(s) have NO topics assigned:`);
    untagged.forEach((q) => console.log(`  - ${q.externalId}`));
  }
}

main();