import objectIdSchema from "@/app/api/objectIdSchema";
import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import { getAllUserMatches } from "@/lib/matches";
import { getAllPlayersByUser } from "@/lib/players";
import { getUserTeams } from "@/lib/teams";
import { TeamType } from "@/lib/types";
import Match from "@/models/Match";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PutValidation = z.object({
    userId: objectIdSchema,
    data: z.object({
        firstName: z.string().trim().min(1).max(50),
        lastName: z.string().trim().min(1).max(50),
        email: z.string().trim().email().max(100),
        mobCode: z.string().trim(),
        mobile: z.string().trim()
    })
});

export async function PUT(req:NextRequest, { params }: { params: { id:string }}) {
    try {
        await connectToDB();

        const body = await req.json();

        const { id } = await params;
        const parsed = PutValidation.safeParse({ userId: id, data: body.data })
        if (!parsed.success) throw new HttpError(parsed.error.message, 400);
        const { userId, data } = parsed.data;

        const user = await User.findById(userId);
        if (!user) throw new HttpError("User not found", 400);

        await User.updateOne(
            { _id: userId },
            {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                mobCode: data.mobCode,
                mobile: data.mobile
            }
        );

        const oldName = `${user.firstName} ${user.lastName}`;
        const newName = `${data.firstName} ${data.lastName}`;
        const nameChange:boolean = oldName !== newName;

        if (nameChange) {
            console.log("Name Change to matches");
            const players = await getAllPlayersByUser(userId);
            const teams  = [];
            for (const player of players) {
                const playerTeams = await getUserTeams(player._id);
                teams.push(...playerTeams);
            }
    
            const matches = await getAllUserMatches(players, teams);
    
            matches.forEach(match => {
                match.participants.forEach(participant => {
                    if (participant.name === oldName) {
                        participant.name = newName;
                    } else if (participant.name.includes(oldName)) {
                        participant.name = participant.name.replace(oldName, newName);
                    }
                });
            });
    
            await Promise.all(matches.map(match =>
                Match.updateOne(
                    { _id: match._id },
                    { $set: { participants: match.participants } }
                )
            ));
        }


        return new NextResponse(null, { status: 204 });    
    } catch (err:any) {
        console.log(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
