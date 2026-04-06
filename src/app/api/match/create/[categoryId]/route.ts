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
    _id: objectIdSchema,
    tournament: objectIdSchema,
    user: z.object({
        _id: objectIdSchema,
        firstName: z.string().trim().max(50),
        lastName: z.string().trim().max(50),
    }),
    male: z.boolean(),
    categories: z.array(objectIdSchema),
    seeded: z.boolean(),
    ranking: z.number(),
});

const TeamParticipantValidation = z.object({
    _id: objectIdSchema,
    tournament: objectIdSchema,
    category: objectIdSchema,
    players: z.tuple([
        PlayerParticipantValidation,
        PlayerParticipantValidation,
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
                    _id: participant._id,
                    participantId: participant._id,
                    participantModel: categoryInfo.doubles ? "Team" : "Player",
                    resultText: "",
                    isWinner: false,
                    status: "",
                    /*
                     * --- NOTE ON TYPE FIX ---
                     *  The fix below fixes the type issue when assigning the correct name to participants. The problem was that our 
                     *  validation above allows either a Team or a Player and we have to merge this information into one object of the 
                     *  same type. 
                     *
                     *  "players" in participant explicitly checks for the existance of players in our validation, hence this fixes our error.
                     *
                     *  TODO: A cleaner fix would be to introduce participantModel earlier in the creation of matches. We can then simply run the conditional:
                     *
                     *  participantModel === "Team" ? ... : ...
                     *
                    */
                    name: "players" in participant
                        ? `${participant.players[0].user.firstName} ${participant.players[0].user.lastName}
                         and 
                         ${participant.players[1].user.firstName} ${participant.players[1].user.lastName}` 
                        : `${participant.user.firstName} ${participant.user.lastName}`,
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

        const savedMatches = await Promise.all(matchesFinal.map(async (match) => {
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
