import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ notifications });
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id, read } = await request.json();
  if (id) {
    await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { read } });
  } else {
    await prisma.notification.updateMany({ where: { userId: user.id }, data: { read: true } });
  }
  return NextResponse.json({ success: true });
}
