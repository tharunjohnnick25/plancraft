import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { mockUsers } from "@/lib/api/mock-db";

const MOCK_PASSWORDS: Record<string, string> = {
  "admin@plancraft.ai": "Admin123",
  "demo@plancraft.ai": "Demo123",
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const valid = await verifyPassword(password, user.password);
        if (!valid) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
        const token = signToken({ userId: user.id, email: user.email, role: user.role });
        const { password: _, ...userWithoutPassword } = user;
        const response = NextResponse.json({ user: userWithoutPassword, token });
        response.cookies.set("plancraft_token", token, {
          httpOnly: true, secure: process.env.NODE_ENV === "production",
          sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/",
        });
        return response;
      }
    } catch {}

    const mockUser = mockUsers.find((u) => u.email === email);
    if (!mockUser || MOCK_PASSWORDS[email] !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = signToken({ userId: mockUser.id, email: mockUser.email, role: mockUser.role });
    const response = NextResponse.json({ user: mockUser, token });
    response.cookies.set("plancraft_token", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/",
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
