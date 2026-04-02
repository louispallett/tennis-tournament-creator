import objectIdSchema from "@/app/api/objectIdSchema";
import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import { convertToMatch } from "@/lib/matches";
import { MatchType } from "@/lib/types";
import Category from "@/models/Category";
import Match from "@/models/Match";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

//? Having both user and players as optional allows us to use this for both teams and players (doubles and singles)
const PlayerParticipantValidation = z.object({
  _id: z.string().trim(),
  tournament: objectIdSchema,
  user: z.object({
    _id: objectIdSchema,
    firstName: z.string().trim().max(50),
    lastName: z.string().trim().max(50),
  }),
  categories: z.array(objectIdSchema),
  male: z.boolean(),
  seeded: z.boolean(),
  ranking: z.number(),
});

const TeamParticipantValidation = z.object({
  _id: z.string().trim(),
  tournament: objectIdSchema,
  category: objectIdSchema,
  players: z.tuple([
    z.object({
      user: z.object({
        firstName: z.string().trim().max(50),
        lastName: z.string().trim().max(50),
      }),
    }),
    z.object({
      user: z.object({
        firstName: z.string().trim().max(50),
        lastName: z.string().trim().max(50),
      }),
    }),
  ]),
  ranking: z.number(),
});

const MatchValidation = z.object({
    _id: objectIdSchema,
    participants: z.union([
        z.array(PlayerParticipantValidation),
        z.array(TeamParticipantValidation),
    ]),
    tournamentRoundText: z.string().trim().max(20),
    nextMatchId: objectIdSchema.nullable(),
    qualifyingMatch: z.boolean(),
    previousMatchId: z.array(objectIdSchema).optional(),
});


const PostValidation = z.object({
    categoryIdSafe: objectIdSchema,
    matches: z.array(MatchValidation).min(1, { message: "At least one match is required" }),
    dates: z.record(z.coerce.date()),
});

export async function POST(req:NextRequest, { params }: { params: { categoryId:string }}) {
    try {
        await connectToDB();

        const body = await req.json();
        const { categoryId } = await params;

        const parsed = PostValidation.safeParse({ 
            categoryIdSafe: categoryId, 
            matches: body.matches, 
            dates: body.data 
        });
        if (!parsed.success) throw new HttpError(parsed.error.message, 400);
        const { categoryIdSafe, matches, dates } = parsed.data;

        const matchesExist = await Match.findOne({ category: categoryIdSafe });
        if (matchesExist) throw new HttpError("Matches for this category have already been created", 401);

        const categoryInfo = await Category.findById(categoryIdSafe);

        const matchesFinal:MatchType[] = [];

        for (const match of matches) {
            const participantsPopulated = [];
            for (const participant of match.participants) {
                participantsPopulated.push({
                    participantId: participant._id,
                    participantModel: categoryInfo.doubles ? "Team" : "Player",
                    resultText: "",
                    isWinner: false,
                    status: "",
                    name: categoryInfo.doubes 
                        ? `${participant.players ? participant.players[0].user.firstName : ""}
                         ${participant.players ? participant.players[0].user.lastName : ""}
                         and 
                         ${participant.players ? participant.players[1].user.firstName : ""}
                         ${participant.players ? participant.players[1].user.lastName : ""}` 
                        : `${participant.user ? participant.user.firstName : ""} ${participant.user ? participant.user.lastName : ""}`,
                });
            }

            matchesFinal.push(convertToMatch(
                match,
                categoryInfo.tournament,
                categoryInfo._id,
                participantsPopulated,
                "SCHEDULED",
                dates[Number(match.tournamentRoundText)],
                0
            ));
        }

        const savedMatches = await Promise.all(matches.map(async (match) => {
            const newMatch = new Match(match);
            return newMatch.save();
        }));

        await Category.updateOne(
            { _id: categoryIdSafe },
            { locked: true }
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
