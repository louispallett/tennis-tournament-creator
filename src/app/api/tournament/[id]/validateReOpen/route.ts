import objectIdSchema from "@/app/api/objectIdSchema";
import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import Category from "@/models/Category";
import Match from "@/models/Match";
import Team from "@/models/Team";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GetValidation = z.object({
    tournamentId: objectIdSchema
})

export async function GET(req:NextRequest, { params }: { params: { id:string }}) {
    try {
        await connectToDB();
        const { id } = await params;
        const parsed = GetValidation.safeParse({ tournamentId: id });
        if (!parsed.success) throw new HttpError(parsed.error.message, 400);
        const { tournamentId } = parsed.data;

        const invalid: Number[] = [];

        const teams = await Team.find({ tournament: tournamentId });
        const matches = await Match.find({ tournament: tournamentId });
        const categories = await Category.find({ tournament: tournamentId, locked: true });
        
        if (!teams || !matches || !categories) {
            throw new HttpError("Failed to fetch resources", 500);
        }

        if (teams.length > 0) invalid.push(0);
        if (matches.length > 0) invalid.push(1);
        if (categories.length > 0) invalid.push(2);

        return NextResponse.json(invalid, { status: 200 });
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
