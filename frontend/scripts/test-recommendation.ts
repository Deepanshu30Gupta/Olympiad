/**
 * Tests the recommendation engine directly against real seeded data,
 * without any UI. Run this against your own test user's clerkId to see
 * exactly what question it picks and why.
 *
 * Usage:
 *   npx tsx scripts/test-recommendation.ts <your-clerkId>
 *   npx tsx scripts/test-recommendation.ts <your-clerkId> IOQM
 *   npx tsx scripts/test-recommendation.ts <your-clerkId> IOQM number-theory
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { getNextQuestion } from "../services/recommendation-service";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const clerkId = process.argv[2];
  const examType = process.argv[3];
  const topicFocus = process.argv[4];

  if (!clerkId) {
    console.error("Usage: npx tsx scripts/test-recommendation.ts <clerkId> [examType] [topicFocus]");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    console.error(`No user found with clerkId ${clerkId}. Check Prisma Studio for the right value.`);
    process.exit(1);
  }

  console.log(`Testing recommendation for user: ${user.email}`);
  console.log(`Filters: examType=${examType ?? "(none)"}, topicFocus=${topicFocus ?? "(none)"}\n`);

  const result = await getNextQuestion(user.id, { examType, topicFocus });

  if (!result.question) {
    console.log("No question returned.");
    console.log("Reason:", result.reason);
  } else {
    console.log("Question selected:");
    console.log(`  ${result.question.externalId} — ${result.question.statement.slice(0, 100)}...`);
    console.log(`  Rating: ${result.question.currentRating}, Difficulty: ${result.question.difficultyLabel}`);
    console.log(`  Topic: ${result.chosenTopic?.name} (student rating ${result.chosenTopic?.studentRating})`);
    console.log(`  Expected score: ${result.expectedScore?.toFixed(2)}`);
    console.log(`  ${result.reason}`);
  }
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(process.exitCode ?? 0);
  });