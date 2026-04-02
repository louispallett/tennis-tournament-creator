import { connectToDB } from "@/lib/db";
import { generateMatches } from "@/lib/generateMatches";
import HttpError from "@/lib/HttpError";
import { PlayerTypePopulated } from "@/lib/types";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/* --- client-generate-POST ---
 * Request to generate players from home/genereate-matches.
 *
 * This does not require sign-up and uses an array of player objects only.
 * 
 * It makes a direct call to generateMatches()
 */ 

const generatePlayer = (name: string, rank: number): PlayerTypePopulated => {
    return {
        _id: rank.toString(),
        tournament: new Types.ObjectId(),
        user: {
            firstName: name,
            lastName: "",
            fullname: name
        },
        male: true,
        categories: [],
        seeded: false,
        ranking: rank
    }
}

const PostValidation = z.object({
    players: z.array(
        z.object({
            name: z.string().trim().min(1, "Name is required").max(200),
            rank: z.number().int().positive("Rank must be a positive number"),
        })
    ),
    })
    .transform((data) => {
    const players = [...data.players].sort((a, b) => a.rank - b.rank);
    return { players };
    // const playerNames = sortedPlayers.map((p) => p.name.trim());
    // return { players: playerNames };
});

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

        const { players } = parsed.data;
        const numOfPlayers = players.length;
        const playersPopulated = [];
        for (const player of players) {
           playersPopulated.push(generatePlayer(player.name, player.rank)); 
        }
        const matches = generateMatches(playersPopulated);

        // The total number of matches must equal the number of players - 1. This is a fail-safe in case it doesn't.
        if (matches.length != numOfPlayers - 1) {
            const error = "Error generating matches. Code: client-generate-GET/array-size-is-unexpected";
            console.error(error);
            throw new HttpError(error, 500);
        }

        for (let match of matches) {
            match.participants = match.participants.map((participant) => {
                const newParticipant = {
                    name: participant,
                    resultText: ""
                };
                
                return newParticipant;
            });
        }

        return NextResponse.json({ matches });
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
