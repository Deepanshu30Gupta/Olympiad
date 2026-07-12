-- AlterEnum
ALTER TYPE "AttemptStatus" ADD VALUE 'SURRENDERED';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "examType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "surrenderLockSeconds" INTEGER NOT NULL DEFAULT 0;
