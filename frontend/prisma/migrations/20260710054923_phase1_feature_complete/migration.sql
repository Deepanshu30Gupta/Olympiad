/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `Attempt` table. All the data in the column will be lost.
  - You are about to drop the column `timeTakenSeconds` on the `Attempt` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `startedAt` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `externalId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemNumber` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solutionMarkdown` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('SOLVED', 'WRONG', 'SKIPPED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "SavedType" AS ENUM ('BOOKMARK', 'REVIEW_LATER');

-- AlterTable
ALTER TABLE "Attempt" DROP COLUMN "isCorrect",
DROP COLUMN "timeTakenSeconds",
ADD COLUMN     "activeSolvingSeconds" INTEGER,
ADD COLUMN     "confidenceRating" INTEGER,
ADD COLUMN     "hintLevelUsed" INTEGER,
ADD COLUMN     "solutionViewed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "AttemptStatus" NOT NULL,
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "currentRating" INTEGER NOT NULL DEFAULT 1200,
ADD COLUMN     "diagramSvg" TEXT,
ADD COLUMN     "difficultyLabel" TEXT,
ADD COLUMN     "estimatedSolveSeconds" INTEGER,
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "problemNumber" INTEGER NOT NULL,
ADD COLUMN     "solutionMarkdown" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "description" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dailyGoal" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "lastActiveDate" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "overallRating" INTEGER NOT NULL DEFAULT 1200,
ADD COLUMN     "totalAttempted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSolved" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Hint" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "SavedType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hint_questionId_level_key" ON "Hint"("questionId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "SavedQuestion_userId_questionId_type_key" ON "SavedQuestion"("userId", "questionId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Question_externalId_key" ON "Question"("externalId");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedQuestion" ADD CONSTRAINT "SavedQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedQuestion" ADD CONSTRAINT "SavedQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
