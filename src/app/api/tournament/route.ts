import { connectToDB } from "@/lib/db";
import { cookies } from "next/headers";
import generator from "generate-password";
import HttpError from "@/lib/HttpError";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import Tournament from "@/models/Tournament";
import { z } from "zod";
import Category from "@/models/Category";
import User from "@/models/User";
import { TournamentTypePopulated } from "@/lib/types";

export async function GET() {
    try {
        await connectToDB();
    
        const tournaments:TournamentTypePopulated[] = await Tournament.find()
            .populate({
                path: "host",
                select: "firstname lastname -_id",
                model: User,
            });
        
        if (!tournaments) throw new Error();

        return NextResponse.json(tournaments);
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    } 
}

const PostValidation = z.object({
    name: z.string().trim().max(100),
    showMobile: z.boolean(),
    categories: z.array(z.string())
})

export async function POST(req:NextRequest) {
    try {
        await connectToDB();
        
        const cookieStore = cookies();
        const token = (await cookieStore).get("token")?.value;

        if (!token) throw new HttpError("Unauthorized: No token provided", 401);

        let userId:string | null = null;

        try {
            const decoded:any = jwt.verify(token, process.env.JWT_SECRET!);
            userId = decoded?.userId;

            if (!userId) {
                throw new HttpError("Invalid token payload", 401);
            }
        } catch (err:any) {
            console.error(err);
            return NextResponse.json(
                { success: false, message: err.message || "Internal Server Error" },
                { status: err.statusCode || 500 }
            );
        }
        
        const body = await req.json()

        const parsed = PostValidation.safeParse(body);

        if(!parsed.success) {
            console.error(parsed.error.flatten().fieldErrors);
            return NextResponse.json({
                message: "Validation Errors",
                errors: parsed.error.flatten().fieldErrors,
            }, { status: 400 });
        }

        const { name, showMobile, categories } = parsed.data;

        const tournamentExists = await Tournament.findOne({ name, host: userId });
        if (tournamentExists) {
            throw new HttpError("You have already created a tournament with this name", 400);
        }

        // Create our tournament code:
        let code = generator.generate({
            length: 10,
            numbers: true,
            symbols: false,
            exclude: "'\"`;_@,.-{}[]~#\\|¬",
            strict: true
        });

        code = name.split(" ")[0] + code;
        
        // Ensure that tournament code doesn't already exist
        while (true) {
            const codeExists = await Tournament.findOne({ code });
            if (!codeExists) break;
            code = generator.generate({
                length: 15,
                numbers: true,
                symbols: false,
                exclude: "'\"`;_@,.-{}[]~#\\|¬",
                strict: true
            });
            code = name.replace(/\s/g,'') + code;
        }

        const tournamentCategories = categories.map(name => ({
            name,
            doubles: ["Men's Doubles", "Women's Doubles", "Mixed Doubles"].includes(name),
        }));

        const tournament = await Tournament.create({
            name,
            host: userId,
            code,
            showMobile, 
        });

        for (let category of tournamentCategories) {
            await Category.create({
                name: category.name,
                tournament: tournament._id,
                doubles: category.doubles
            });
        }

        return NextResponse.json(tournament, { status: 201 });

    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
