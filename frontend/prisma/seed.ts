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
    // 1. Make sure every topic this question references exists.
    const topicRecords = await Promise.all(
      q.topics.map((slug) =>
        prisma.topic.upsert({
          where: { slug },
          update: {},
          create: { slug, name: slugToDisplayName(slug) },
        })
      )
    );

    // 2. Upsert the question's own fields. currentRating is deliberately
    //    excluded from the update branch — it's the live, Elo-calibrated
    //    value from real student attempts, and a content edit should
    //    never reset it.
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
      },
    });

    // 3. Sync topic links: make the QuestionTopic rows exactly match the
    //    JSON's topics array. Safe to fully replace — this join table
    //    carries no data of its own beyond the link, so deleting and
    //    recreating it loses nothing (unlike deleting a Question, which
    //    would cascade into real Attempt/SavedQuestion/Hint data).
    await prisma.questionTopic.deleteMany({ where: { questionId: question.id } });
    await prisma.questionTopic.createMany({
      data: topicRecords.map((t) => ({ questionId: question.id, topicId: t.id })),
    });

    // 4. Sync hints: remove any hint LEVEL no longer present in the JSON,
    //    then upsert every hint currently in the JSON.
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