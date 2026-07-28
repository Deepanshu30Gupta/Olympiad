import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getBookmarkedQuestions, getTodaysGoalProgress } from "@/services/dashboard-service";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { PracticeAllBookmarksButton } from "@/features/dashboard/PracticeAllBookmarksButton";
import { BookmarkListItem } from "@/features/dashboard/BookmarkListItem";

export default async function BookmarksPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return <div className="p-8">Not signed in.</div>;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;

  const [bookmarks, todaysGoal] = await Promise.all([
    getBookmarkedQuestions(dbUser.id),
    getTodaysGoalProgress(dbUser.id, dbUser.dailyGoal),
  ]);

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            🔖 Bookmarks
          </h1>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">Questions you&rsquo;ve saved for later.</p>
            {bookmarks.length > 0 && <PracticeAllBookmarksButton />}
          </div>

          {bookmarks.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[#F0E6D6] bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">
                No bookmarks yet — tap the bookmark icon on any question while practicing to save it here.
              </p>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-3">
              {bookmarks.map((b) => (
                <BookmarkListItem
                  key={b.id}
                  questionId={b.question.id}
                  externalId={b.question.externalId}
                  examType={b.question.examType}
                  difficultyLabel={b.question.difficultyLabel}
                  statement={b.question.statement}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}