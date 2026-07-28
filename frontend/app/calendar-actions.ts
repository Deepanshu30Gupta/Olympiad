"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCalendarMonthData } from "@/services/dashboard-service";

export async function getCalendarMonthAction(year: number, month: number) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return { data: null, error: "Not signed in." };
    const dbUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: clerkUser.id } });
    const data = await getCalendarMonthData(dbUser.id, year, month);
    return { data, error: null };
  } catch (err) {
    console.error("getCalendarMonthAction failed:", err);
    return { data: null, error: "Couldn't load that month." };
  }
}