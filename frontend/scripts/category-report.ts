/**
 * Reports question counts rolled up to the 6 MAJOR categories only
 * (ignoring which specific subtopic within each). A question tagged with
 * ANY subtopic under a category (e.g. "nt-gcd-lcm") counts toward that
 * category ("Number Theory"), same as if it were tagged with the bare
 * parent slug directly.
 *
 * Usage:
 *   npx tsx scripts/category-report.ts
 */

import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve("prisma/data");

// Maps every known topic slug (parent or child) to its major category label.
const CATEGORY_MAP: Record<string, string> = {
  "number-theory": "Number Theory",
  "nt-divisibility": "Number Theory",
  "nt-gcd-lcm": "Number Theory",
  "nt-modular-arithmetic": "Number Theory",
  "nt-diophantine": "Number Theory",
  "nt-primes-factorization": "Number Theory",
  "nt-base-representations": "Number Theory",

  "algebra": "Algebra",
  "algebra-polynomials": "Algebra",
  "algebra-functional-equations": "Algebra",
  "algebra-sequences-series": "Algebra",
  "algebra-manipulation": "Algebra",

  "geometry": "Geometry",
  "geometry-triangles": "Geometry",
  "geometry-circles": "Geometry",
  "geometry-coordinate": "Geometry",
  "geometry-transformations": "Geometry",
  "geometry-quadrilaterals": "Geometry",

  "inequalities": "Inequalities",
  "inequalities-classical": "Inequalities",
  "inequalities-cs-pm": "Inequalities",
  "inequalities-substitution": "Inequalities",

  "combinatorics": "Combinatorics",
  "combinatorics-counting": "Combinatorics",
  "combinatorics-pigeonhole": "Combinatorics",
  "combinatorics-geometry": "Combinatorics",
  "combinatorics-graph-theory": "Combinatorics",

  "probability-stats": "Probability & Statistics",
  "probability-expected-value": "Probability & Statistics",
  "probability-basic": "Probability & Statistics",
};

const ALL_CATEGORIES = [
  "Number Theory",
  "Algebra",
  "Geometry",
  "Inequalities",
  "Combinatorics",
  "Probability & Statistics",
];

interface SeedQuestion {
  externalId: string;
  topics: string[];
}
interface SeedFile {
  questions: SeedQuestion[];
}

function main() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const allQuestions: SeedQuestion[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    const data: SeedFile = JSON.parse(raw);
    allQuestions.push(...data.questions);
  }

  const counts: Record<string, number> = {};
  ALL_CATEGORIES.forEach((c) => (counts[c] = 0));
  const unmapped = new Set<string>();
  const untagged: string[] = [];

  for (const q of allQuestions) {
    if (q.topics.length === 0) {
      untagged.push(q.externalId);
      continue;
    }
    const categoriesHit = new Set<string>();
    for (const topic of q.topics) {
      const category = CATEGORY_MAP[topic];
      if (!category) {
        unmapped.add(topic);
        continue;
      }
      categoriesHit.add(category);
    }
    categoriesHit.forEach((c) => (counts[c] += 1));
  }

  console.log(`\nTotal questions: ${allQuestions.length}\n`);
  console.log("=== Questions per MAJOR category ===");
  console.table(counts);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`(Sum may exceed total question count if some questions span multiple categories: ${total})`);

  if (unmapped.size > 0) {
    console.log(`\nWARNING: unrecognized topic slug(s) found: ${[...unmapped].join(", ")}`);
  }
  if (untagged.length > 0) {
    console.log(`\nWARNING: ${untagged.length} question(s) with no topics at all:`);
    untagged.forEach((id) => console.log(`  - ${id}`));
  }
  console.log("");
}

main();