import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const { id } = await params;
  const project = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const rooms = [
    { name: "Living Room", width: 20, length: 25, level: 0, type: "living", area: 500 },
    { name: "Master Bedroom", width: 16, length: 18, level: 0, type: "bedroom", area: 288 },
    { name: "Kitchen", width: 12, length: 15, level: 0, type: "kitchen", area: 180 },
    { name: "Bathroom 1", width: 8, length: 10, level: 0, type: "bathroom", area: 80 },
    { name: "Bathroom 2", width: 8, length: 10, level: 1, type: "bathroom", area: 80 },
  ];
  if (project.floors > 1) {
    rooms.push(
      { name: "Bedroom 2", width: 14, length: 14, level: 1, type: "bedroom", area: 196 },
      { name: "Bedroom 3", width: 13, length: 14, level: 1, type: "bedroom", area: 182 },
    );
  }

  await prisma.room.deleteMany({ where: { projectId: id } });
  await prisma.room.createMany({ data: rooms.map(r => ({ ...r, projectId: id })) });

  const builtUp = rooms.reduce((s, r) => s + (r.area || 0), 0);
  const costPerSqft = { Economy: 60, Standard: 85, Premium: 125, "Ultra Luxury": 175 };
  const cps = costPerSqft[project.budgetTier as keyof typeof costPerSqft] || 85;
  const baseCost = builtUp * cps;
  const costData = {
    foundation: Math.round(baseCost * 0.18),
    concrete: Math.round(baseCost * 0.13),
    steel: Math.round(baseCost * 0.12),
    brick: Math.round(baseCost * 0.08),
    flooring: Math.round(baseCost * 0.14),
    plumbing: Math.round(baseCost * 0.06),
    electrical: Math.round(baseCost * 0.05),
    labor: Math.round(baseCost * 0.16),
    contingency: Math.round(baseCost * 0.05),
    designFees: Math.round(baseCost * 0.03),
    total: baseCost,
    projectId: id,
  };

  await prisma.costEstimate.deleteMany({ where: { projectId: id } });
  await prisma.costEstimate.create({ data: costData });

  const updated = await prisma.project.update({
    where: { id },
    data: { status: "completed", updatedAt: new Date().toISOString() },
    include: { rooms: true, costEstimate: true },
  });

  await prisma.user.update({ where: { id: user.id }, data: { aiCreditsUsed: { increment: 1 } } });

  return NextResponse.json({ project: updated });
}
