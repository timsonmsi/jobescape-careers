import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, isRegister } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (isRegister) {
      // Check if candidate already exists
      const existingCandidate = await prisma.candidate.findUnique({
        where: { email },
      });

      if (existingCandidate) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }

      // Hash password and create new candidate
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const candidate = await prisma.candidate.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split("@")[0],
          status: "NEW",
        },
      });

      return NextResponse.json({
        success: true,
        candidate: {
          id: candidate.id,
          email: candidate.email,
          name: candidate.name,
        },
      });
    } else {
      // Sign in - verify password
      const candidate = await prisma.candidate.findUnique({
        where: { email },
      });

      if (!candidate || !candidate.password) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, candidate.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        candidate: {
          id: candidate.id,
          email: candidate.email,
          name: candidate.name,
        },
      });
    }
  } catch (error) {
    console.error("Error in candidate auth:", error);
    return NextResponse.json(
      { error: "Failed to authenticate candidate" },
      { status: 500 }
    );
  }
}
