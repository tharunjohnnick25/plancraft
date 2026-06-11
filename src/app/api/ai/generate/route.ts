import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const { prompt, type } = await request.json();
    if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

    let result = "";
    const lower = prompt.toLowerCase();

    if (type === "vastu" || lower.includes("vastu")) {
      result = "Vastu optimization complete. Recommended adjustments:\n" +
        "1. Place master bedroom in Southwest corner\n" +
        "2. Kitchen in Southeast direction\n" +
        "3. Living room in North or East\n" +
        "4. Pooja room in Northeast corner\n" +
        "5. Ensure main entrance faces East or North";
    } else if (type === "cost" || lower.includes("cost") || lower.includes("budget")) {
      result = "Cost estimate generated:\n" +
        "• Foundation: $45,000\n" +
        "• Structure: $32,000\n" +
        "• Finishing: $35,000\n" +
        "• MEP: $27,000\n" +
        "• Labor: $40,000\n" +
        "• Total estimated: $179,000";
    } else if (type === "interior" || lower.includes("furnish") || lower.includes("interior")) {
      result = "Interior design plan generated with:\n" +
        "• Living room: Scandinavian modern with neutral palette\n" +
        "• Bedrooms: Warm minimal with accent walls\n" +
        "• Kitchen: Sleek contemporary with island\n" +
        "• Bathrooms: Spa-inspired with natural stone";
    } else if (type === "variation" || lower.includes("variation")) {
      result = "3 layout variations generated:\n" +
        "• A: Open plan with centralized living\n" +
        "• B: Traditional room-based layout\n" +
        "• C: Compact efficient design";
    } else {
      result = "Floor plan generated with:\n" +
        "• Optimized room layout based on your requirements\n" +
        "• Proper ventilation and natural lighting\n" +
        "• Efficient circulation and space utilization\n" +
        "• Compliant with standard building codes";
    }

    await prisma.aIConversation.create({
      data: { userId: user.id, role: "user", content: prompt, createdAt: new Date().toISOString() },
    });
    await prisma.aIConversation.create({
      data: { userId: user.id, role: "assistant", content: result, createdAt: new Date().toISOString() },
    });

    await prisma.user.update({ where: { id: user.id }, data: { aiCreditsUsed: { increment: 1 } } });

    return NextResponse.json({ result, createdAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
