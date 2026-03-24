import { connectToDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { rateLimitIP } from "@/lib/rateLimiter";

const ValidationSchema = z.object({
  email: z.string().trim().email().max(100),
  password: z.string().max(200),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    if (rateLimitIP(ip, 10, 60_000)) {
      return NextResponse.json(
        { message: "Too many login attempts, please try again later." },
        { status: 429 },
      );
    }

    await connectToDB();
    const body = await req.json();

    const parsed = ValidationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation Errors", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!(await bcrypt.compare(password, user?.password || ""))) {
      return NextResponse.json({ message: "Invalid Credentials" }, { status: 401 });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "36h",
    });

    const responseBody = process.env.NODE_ENV === "test" ? { token } : { success: true };
    const response = NextResponse.json(responseBody, { status: 200 });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 36,
    });

    return response;
  } catch (err: any) {
    console.error("Login error: ", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: err.statusCode || 500 },
    );
  }
}
