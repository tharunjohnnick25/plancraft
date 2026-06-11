import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const original = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: { rooms: true, costEstimate: true, materials: true },
  });
  if (!original) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const now = new Date().toISOString();
  const dup = await prisma.project.create({
    data: {
      name: `${original.name} (Copy)`,
      description: original.description,
      userId: user.id,
      plotLength: original.plotLength,
      plotWidth: original.plotWidth,
      facing: original.facing,
      floors: original.floors,
      budgetTier: original.budgetTier,
      style: original.style,
      vastu: original.vastu,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    },
  });
  if (original.rooms.length > 0) {
    await prisma.room.createMany({
      data: original.rooms.map(r => ({
        name: r.name, width: r.width, length: r.length, level: r.level,
        area: r.area, ceiling: r.ceiling, type: r.type, color: r.color,
        projectId: dup.id,
      })),
    });
  }
  await prisma.user.update({ where: { id: user.id }, data: { projectsCount: { increment: 1 } } });
  return NextResponse.json({ project: dup }, { status: 201 });
}
