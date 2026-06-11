import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const { projectId, format } = await request.json();
    if (!projectId || !format) {
      return NextResponse.json({ error: "Project ID and format required" }, { status: 400 });
    }
    const exportEntry = await prisma.export.create({
      data: {
        projectId,
        type: "plan",
        format,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    });
    return NextResponse.json({ export: exportEntry });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const exports = await prisma.export.findMany({
    where: { project: { userId: user.id } },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ exports });
}
