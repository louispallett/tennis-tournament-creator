import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import { TournamentTypePopulated } from "@/lib/types";
import Tournament from "@/models/Tournament";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GetValidation = z.string().trim();

export async function GET(req:NextRequest, { params }: { params: { code:string }}) {
    try {
        await connectToDB();
        const { code } = await params;
        const parsed = GetValidation.safeParse(code);
        if (!parsed.success) throw new HttpError(parsed.error.message, 400);

        const codeSafe = parsed.data;

        const tournament:TournamentTypePopulated = await Tournament.findOne({ code: codeSafe })
            .populate({ 
                path: "host",
                select: "firstName lastName -_id",
                model: User
            });

        if (!tournament) {
            throw new HttpError("Incorrect tournament code", 400);
        }

        return NextResponse.json(tournament, { status: 200 });
    } catch (err:any) {
        console.log(err.message);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
