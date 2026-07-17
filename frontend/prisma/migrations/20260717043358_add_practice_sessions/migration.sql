-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examTypes" TEXT[],
    "topicFocus" TEXT[],
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentQuestionId" TEXT,
    "questionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PracticeSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
