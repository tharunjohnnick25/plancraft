import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const vastuRules = [
  { room: "Master Bedroom", direction: "Southwest", reason: "Promotes stability and strong relationships" },
  { room: "Kitchen", direction: "Southeast", reason: "Agni (fire) direction for cooking" },
  { room: "Living Room", direction: "North or East", reason: "Attracts positive energy and social harmony" },
  { room: "Pooja Room", direction: "Northeast", reason: "Ishaan corner for spiritual activities" },
  { room: "Study", direction: "East or North", reason: "Enhances concentration and knowledge" },
  { room: "Guest Room", direction: "Northwest", reason: "Suitable for guests and temporary stays" },
  { room: "Bathroom", direction: "West or Northwest", reason: "Avoid Northeast and Southwest" },
];

const styleTips: Record<string, string[]> = {
  Modern: ["Use large windows for natural light", "Open floor plan with minimal partitions", "Neutral color palette with accent walls", "Flat or sloping roofs"],
  Contemporary: ["Organic shapes and curves", "Sustainable materials", "Indoor-outdoor connection", "Statement lighting fixtures"],
  Scandinavian: ["Light wood flooring throughout", "White walls with warm textiles", "Functional furniture with clean lines", "Maximize natural light"],
  Mediterranean: ["Terracotta flooring and warm tones", "Arched doorways and windows", "Courtyard or patio integration", "Stucco exterior finishes"],
  Farmhouse: ["Wraparound porch", "Exposed wooden beams", "Farmhouse sink in kitchen", "Shiplap wall accents"],
  Minimalist: ["Clean lines and simple forms", "Hidden storage solutions", "Monochromatic color scheme", "Quality over quantity"],
};

function generatePlanResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("vastu") || lower.includes("vastu")) {
    const room = vastuRules.find(r => lower.includes(r.room.toLowerCase()));
    if (room) {
      return `According to Vastu Shastra, the ${room.room} should be placed in the **${room.direction}** direction. ${room.reason}. I recommend positioning this room accordingly in your layout.`;
    }
    return "Vastu Shastra recommends:\n" +
      vastuRules.map(r => `• **${r.room}** → ${r.direction} — ${r.reason}`).join("\n");
  }

  if (lower.includes("cost") || lower.includes("budget") || lower.includes("estimate")) {
    return "Based on current construction costs in India:\n\n" +
      "• **Economy**: ₹1,500-2,000/sqft — Basic materials, standard finishes\n" +
      "• **Standard**: ₹2,000-3,000/sqft — Good quality, modern finishes\n" +
      "• **Premium**: ₹3,000-4,500/sqft — High-end materials, custom work\n" +
      "• **Ultra Luxury**: ₹4,500+/sqft — Imported materials, premium finishes\n\n" +
      "A 2000 sqft Standard home would cost approximately ₹40-60 lakhs total.";
  }

  if (lower.includes("room") || lower.includes("layout") || lower.includes("plan")) {
    if (lower.includes("bedroom") || lower.includes("bedroom") || lower.includes("bhk")) {
      return "For a 3BHK layout, I recommend:\n" +
        "• **Master Bedroom**: 12x14 ft minimum, with attached bathroom and walk-in closet\n" +
        "• **Bedroom 2 & 3**: 11x12 ft each, with shared bathroom access\n" +
        "• **Living Room**: 15x20 ft open plan connected to dining\n" +
        "• **Kitchen**: 10x12 ft with utility area\n" +
        "• Total carpet area: ~1200-1500 sqft";
    }
    return "Here's a standard room size guide:\n" +
      "• **Living Room**: 15x20 ft (minimum 300 sqft)\n" +
      "• **Master Bedroom**: 12x14 ft (minimum 168 sqft)\n" +
      "• **Kitchen**: 10x12 ft (minimum 120 sqft)\n" +
      "• **Bathroom**: 6x8 ft (minimum 48 sqft)\n" +
      "• **Dining Room**: 10x14 ft (minimum 140 sqft)";
  }

  if (lower.includes("style") || lower.includes("design")) {
    const styles = Object.keys(styleTips);
    return "Popular architectural styles:\n\n" +
      styles.map(s => `**${s}**: ${styleTips[s][0]}`).join("\n") +
      "\n\nWhich style interests you? I can provide more specific guidance.";
  }

  if (lower.includes("ventilation") || lower.includes("lighting") || lower.includes("window")) {
    return "For optimal ventilation and lighting:\n" +
      "• **Cross Ventilation**: Place windows on opposite walls\n" +
      "• **Window Size**: 10-15% of floor area for bedrooms, 15-20% for living\n" +
      "• **Orientation**: North-facing windows get indirect light, South-facing get maximum daylight\n" +
      "• **High Ceilings**: 10-12 ft for better air circulation\n" +
      "• **Skylights**: Great for corridors and bathrooms";
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! I am PlanCraftAI's architecture assistant. I can help with:\n" +
      "• Floor plan layout suggestions\n" +
      "• Vastu compliance guidance\n" +
      "• Construction cost estimates\n" +
      "• Room size recommendations\n" +
      "• Design style advice\n\n" +
      "What would you like to know about your project?";
  }

  return "I understand you're asking about architectural design. Based on best practices:\n\n" +
    "**Key considerations for your project:**\n" +
    "• Ensure proper cross-ventilation in all rooms\n" +
    "• Keep wet areas (kitchen, bathrooms) on one side for plumbing efficiency\n" +
    "• Orient living spaces toward the best view/light\n" +
    "• Plan for at least 10% of area as circulation space\n\n" +
    "Could you provide more details about your plot size and requirements? I can give more specific recommendations.";
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  try {
    const { message, projectId } = await request.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    await prisma.aIConversation.create({
      data: { userId: user.id, projectId: projectId || null, role: "user", content: message, createdAt: new Date().toISOString() },
    });

    const response = generatePlanResponse(message);

    const saved = await prisma.aIConversation.create({
      data: { userId: user.id, projectId: projectId || null, role: "assistant", content: response, createdAt: new Date().toISOString() },
    });

    return NextResponse.json({ message: response, id: saved.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const conversations = await prisma.aIConversation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ conversations });
}
