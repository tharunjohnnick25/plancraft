import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const plans = await prisma.project.findMany({
    where: { userId: user.id, status: "completed" },
    include: { rooms: true, costEstimate: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ plans });
}
