import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import Category from "@/models/Category";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
    try {
        await connectToDB();
    
        const categories = await Category.find();
        if (!categories) throw new Error();
    
        return NextResponse.json(categories);
    } catch (err:any) {
        console.error("Login error: ", err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}

const PostValidation = z.object({
    tournamentId: z.string().trim().refine(
        (v) => mongoose.Types.ObjectId.isValid(v),
        {
            message: "Invalid tag ID"
        }
    ),
    name: z.string().trim().max(15)
});

export async function POST(req:NextRequest) {
    try {
        await connectToDB();

        const cookieStore = cookies();
        const token = (await cookieStore).get("token")?.value;
        if (!token) {
            throw new HttpError( "Unauthorized: No token provided", 401);
        }

        let userId:string | null = null;
        try {
            const decoded:any = jwt.verify(token, process.env.JWT_SECRET!);
            userId = decoded?.userId;

            if (!userId) {
                throw new HttpError("Invalid token payload", 401);
            }
        } catch (err:any) {
            throw new Error(err.message, err.status);
        }

        const body = await req.json();

        const parsed = PostValidation.safeParse(body);
        if(!parsed.success) {
            console.error(parsed.error.flatten().fieldErrors);
            return NextResponse.json({
                message: "Validation Errors",
                errors: parsed.error.flatten().fieldErrors,
            }, { status: 400 });
        }

        const { tournamentId, name } = parsed.data;

        const categoryExists = await Category.findOne({ tournament: tournamentId, name });
        if (categoryExists) {
            throw new HttpError("Category already exists in tournament " + tournamentId, 409);
        }

        const doubles = ["Men's Doubles", "Women's Doubles", "Mixed Doubles"].includes(name);

        const category = await Category.create({
            tournament: tournamentId,
            name,
            doubles
        })

        return NextResponse.json(category, { status: 201 });
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
