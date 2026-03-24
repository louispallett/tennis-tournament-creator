import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import Match from "@/models/Match";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import objectIdSchema from "../objectIdSchema";

export async function GET() {
    await connectToDB();

    const matches = await Match.find();
    return NextResponse.json(matches);
}

const ParticipantValidation = z.object({
    _id: objectIdSchema,
    name: z.string().trim().max(100),
    participantModel: z.enum(["Player", "Team"])
})

const MatchValidation = z.object({
    _id: objectIdSchema,
    participants: z.array(ParticipantValidation),
    tournamentRoundText: z.string().trim().max(20),
    nextMatchId: objectIdSchema.nullable(),
    qualifyingMatch: z.boolean(),
    previousMatchId: z.array(objectIdSchema).optional(),
    date: z.coerce.date(),
});

const PostValidation = z.object({
    tournament: objectIdSchema,
    category: objectIdSchema,
    matches: z.array(MatchValidation).min(1, { message: "At least one match is required" }),
})

export async function POST(req:NextRequest) {
    try {
        await connectToDB();
        const body = await req.json();

        const parsed = PostValidation.safeParse(body);
        if(!parsed.success) {
            console.error(parsed.error.flatten().fieldErrors);
            return NextResponse.json({
                message: "Validation Errors",
                errors: parsed.error.flatten().fieldErrors,
            }, { status: 400 });
        }

        const { tournament, category, matches } = parsed.data;

        const matchesExist = await Match.findOne({ category });
        if (matchesExist) throw new HttpError("Matches for this category have already been created", 401);

        const savedMatches = await Promise.all(
            matches.map((match) => {
                const newMatch = new Match({
                    ...match,
                    tournament,
                    category,
                });
                return newMatch.save();
            })
        );

        return NextResponse.json(savedMatches, { status: 201 });
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
