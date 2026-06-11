import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  let settings = await prisma.settings.findUnique({ where: { userId: user.id } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId: user.id },
    });
  }
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const data = await request.json();
  const settings = await prisma.settings.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });
  return NextResponse.json({ settings });
}
