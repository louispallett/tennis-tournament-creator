import HttpError from "@/lib/HttpError";
import Player from "@/models/Player";
import { NextResponse } from "next/server";
import { z } from "zod";

const PutValidation = z.object({
    categoryId: z.string().trim(),
    players: z.array(z.string().trim()),
});

export async function PUT(
    req:Request,
    { params }: { params: { categoryIdParam:string }}
) {
    try {
        const body = await req.json();
        const { categoryIdParam } = await params;

        const parsed = PutValidation.safeParse({ categoryId: categoryIdParam, players: body.deletedPlayers });
        if (!parsed.success) throw new HttpError(parsed.error.message, 400);

        const categoryId = parsed.data.categoryId.toString().trim();
        const players = parsed.data.players;
        const promises = [];
        
        for (let playerId of players) {
            const player = await Player.findById(playerId);
            if (!player) {
                throw new HttpError(`Player with ID ${playerId} not found`, 404);
            }
            if (!Array.isArray(player.categories)) {
                throw new HttpError(`Invalid categories array for player ${playerId}`, 500);
            }
            const categories = [...player.categories];

            const categoryIndex = player.categories.indexOf(categoryId);

            if (categoryIndex === -1) {
                throw new HttpError("CategoryId not found in player.categories", 500);
            }

            categories.splice(categoryIndex, 1);
            promises.push(
                Player.updateOne(
                    { _id: player._id },
                    { categories }
                )
            );
        }

        await Promise.all(promises);

        return new NextResponse(null, { status: 204 });
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
