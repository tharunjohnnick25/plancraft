import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: { rooms: true, costEstimate: true, materials: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const data = await request.json();
    const now = new Date().toISOString();
    const project = await prisma.project.create({
      data: {
        name: data.name || "Untitled Project",
        description: data.description || "",
        userId: user.id,
        plotLength: data.plotLength || 0,
        plotWidth: data.plotWidth || 0,
        facing: data.facing || "North",
        floors: data.floors || 1,
        budgetTier: data.budgetTier || "Standard",
        style: data.style || "Modern",
        vastu: data.vastu ?? true,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      },
      include: { rooms: true, costEstimate: true },
    });
    await prisma.user.update({ where: { id: user.id }, data: { projectsCount: { increment: 1 } } });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
