/**
 * Seed script: imports a contest's question set (JSON) into the database.
 *
 * This is a FULL SYNC, not just an insert. Every time you run it against a
 * JSON file, the database converges to exactly match that file:
 *   - New questions/topics/hints are created.
 *   - Existing ones are updated in place (matched by externalId / slug /
 *     [questionId, level]).
 *   - Topics or hints REMOVED from the JSON are removed from the database
 *     too (topic/hint LINKS only — never deletes a Question, User, or
 *     Attempt, so real student data is never touched by a content edit).
 *
 * This means: to change anything about a question — statement, answer,
 * topics, hints, solution, whatever — just edit the JSON and re-run this
 * script. No manual deletion, ever.
 *
 * Usage:
 *   npx tsx prisma/seed.ts prisma/data/ioqm-2025.json
 */

import "dotenv/config";
import { PrismaClient, AnswerType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
  /** Optional external reference link (e.g. AoPS wiki page) — kept
   * separate from solutionMarkdown since that field is rendered through
   * renderMathText, which deliberately HTML-escapes non-math text for
   * security. This field is rendered as a real link by the UI instead. */
  sourceUrl?: string | null;
}

interface SeedFile {
  contestSource: string;
  contestYear: number;
  questions: SeedQuestion[];
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx prisma/seed.ts <path-to-seed-file.json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
  const data: SeedFile = JSON.parse(raw);

  console.log(`Syncing ${data.questions.length} questions from ${data.contestSource}...`);
  console.log("Connecting to database...");

  for (const [index, q] of data.questions.entries()) {
    const topicRecords = await Promise.all(
      q.topics.map((slug) =>
        prisma.topic.upsert({
          where: { slug },
          update: {},
          create: { slug, name: slugToDisplayName(slug) },
        })
      )
    );

    const question = await prisma.question.upsert({
      where: { externalId: q.externalId },
      update: {
        problemNumber: q.problemNumber,
        statement: q.statement,
        answerType: q.answerType as AnswerType,
        options: q.options ?? undefined,
        correctAnswer: q.correctAnswer,
        baseRating: q.baseRating,
        difficultyLabel: q.difficultyLabel,
        tags: q.tags,
        contestSource: data.contestSource,
        contestYear: data.contestYear,
        examType: q.examType,
        diagramSvg: q.diagramSvg,
        solutionMarkdown: q.solutionMarkdown,
        estimatedSolveSeconds: q.estimatedSolveSeconds,
        sourceUrl: q.sourceUrl ?? null,
      },
      create: {
        externalId: q.externalId,
        problemNumber: q.problemNumber,
        statement: q.statement,
        answerType: q.answerType as AnswerType,
        options: q.options ?? undefined,
        correctAnswer: q.correctAnswer,
        baseRating: q.baseRating,
        currentRating: q.baseRating,
        difficultyLabel: q.difficultyLabel,
        tags: q.tags,
        contestSource: data.contestSource,
        contestYear: data.contestYear,
        examType: q.examType,
        diagramSvg: q.diagramSvg,
        solutionMarkdown: q.solutionMarkdown,
        estimatedSolveSeconds: q.estimatedSolveSeconds,
        sourceUrl: q.sourceUrl ?? null,
      },
    });

    await prisma.questionTopic.deleteMany({ where: { questionId: question.id } });
    await prisma.questionTopic.createMany({
      data: topicRecords.map((t) => ({ questionId: question.id, topicId: t.id })),
    });

    const desiredLevels = q.hints.map((h) => h.level);
    await prisma.hint.deleteMany({
      where: { questionId: question.id, level: { notIn: desiredLevels } },
    });
    for (const hint of q.hints) {
      await prisma.hint.upsert({
        where: { questionId_level: { questionId: question.id, level: hint.level } },
        update: { content: hint.content },
        create: { questionId: question.id, level: hint.level, content: hint.content },
      });
    }

    console.log(
      `  [${index + 1}/${data.questions.length}] Synced ${q.externalId} (${q.topics.join(", ")}, ${q.hints.length} hints)`
    );
  }

  console.log("Sync complete.");
}

function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

main()
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(process.exitCode ?? 0);
  });