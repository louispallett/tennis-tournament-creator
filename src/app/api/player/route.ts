import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import Category from "@/models/Category";
import Player from "@/models/Player";
import Tournament from "@/models/Tournament";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
    try {
        await connectToDB();

        const players = await Player.find();

        if (!players) throw new Error();

        return NextResponse.json(players);
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );

    }
}

const PostValidation = z.object({
    tournamentId: z.string().trim().refine((v) => mongoose.Types.ObjectId.isValid(v), {
        message: "Invalid tag ID"
    }),
    gender: z.enum(["male", "female"]),
    categories: z.array(z.string().trim().max(15)),
})

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

        const { tournamentId, gender, categories } = parsed.data;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) throw new Error();

        if (tournament.stage != "sign-up") {
            throw new HttpError("Registration for this tournament has now closed", 401);
        }

        const playerExists = await Player.findOne({ tournament: tournamentId, user: userId })
        if (playerExists) throw new HttpError("Player already signed up.", 409);

        //? Having categories as an array of names rather than existing _ids?
        //? Doing it this way is a little safer - someone on the client could mess around with the _id
        const userCategories = [];
        for (let category of categories) {
            const databaseCategory = await Category.findOne({
                tournament: tournamentId,
                name: category
            });
            userCategories.push(databaseCategory._id);
        }

        const player = await Player.create({
            tournament: tournamentId,
            user: userId,
            male: gender === "male",
            categories: userCategories,
        });

        return NextResponse.json(player, { status: 201 });
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
