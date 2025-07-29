// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Define your token payload type
interface JwtPayload {
  userId: string;
  email: string;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  console.log("Middleware triggered!");

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    // Token valid → continue
    return NextResponse.next();
  } catch {
    // Invalid token → redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Apply middleware only to protected routes
export const config = {
  matcher: ["api/safe/:path*", "/api/protected/:path*"],
};
