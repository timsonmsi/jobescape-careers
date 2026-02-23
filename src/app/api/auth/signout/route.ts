import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ success: true });
    }
    
    // The session will be cleared on the next request
    // For now, just return success and let the client handle redirect
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json({ success: true });
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests for signout
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") || "/signin";
  return NextResponse.redirect(new URL(callbackUrl, request.url));
}
