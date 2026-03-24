import { connectToDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "@/models/User";
import { z } from "zod";
import { rateLimitIP } from "@/lib/rateLimiter";

const RegisterSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(100),
  mobCode: z.string().trim(),
  mobile: z.string().trim(),
  password: z
    .string()
    .trim()
    .min(8)
    .max(200)
    .refine(
      (val) =>
        /[A-Z]/.test(val) &&
        /[a-z]/.test(val) &&
        /[0-9]/.test(val) &&
        /[^A-Za-z0-9]/.test(val),
      {
        message: "Password must include upper/lowercase, number, and symbol",
      },
    ),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    if (rateLimitIP(ip, 10, 60_000)) {
      return NextResponse.json(
        { message: "Too many login attempts, please try again later." },
        { status: 429 },
      )
    }
    await connectToDB();
    const body = await req.json();

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation Errors",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, mobCode, mobile, password } =
      parsed.data;

    const userExists = await User.findOne({ email: body.email.toLowerCase() });
    if (userExists) {
      return NextResponse.json(
        { message: "Email already used for another account" },
        { status: 401 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      mobCode,
      mobile,
      password: hashedPassword,
    });

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_PROVIDER,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Tennis Tournament Creator" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to TTS",
      text: `Hi ${firstName},
                \n\nThanks for signing up to Tennis Tournament Creator. 
                \n\nThis application is designed to help you host new tournaments and join active ones. It is designed to be simple and straight-forward to use, however we are always adding and updates trying to improve the application.
                \n\nIf you have any suggestions, queries, or problems, please feel free to respond to this email and I will try to get back to you as soon as possible. I'm always open to suggestions and very grateful to hear them!
                \n\nThe Developer,
                \nLouis Nicholson-Pallett`,
      html: `<p>Hi <strong>${firstName}</strong>,</p>
                <p>Thanks for signing up to Tennis Tournament Creator.</p>
                <p>This application is designed to help you host new tournaments and join active ones. It is designed to be simple and straight-forward to use, however we are always adding and updates trying to improve the application.</p>
                <p>If you have any suggestions, queries, or problems, please feel free to respond to this email and I will try to get back to you as soon as possible. I'm always open to suggestions and very grateful to hear them!</p>
                <p>The Developer, Louis Nicholson-Pallett</p>`,
    };

    if (process.env.NODE_ENV !== "test") {
      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: err.statusCode || 500 },
    );
  }
}
