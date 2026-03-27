import objectIdSchema from "@/app/api/objectIdSchema";
import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import Category from "@/models/Category";
import Player from "@/models/Player";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GetValidation = z.object({
    tournamentId: objectIdSchema
});

export async function GET(req:NextRequest, { params }: { params: { id:string }}) {
    try {
        await connectToDB();
        const { id } = await params;
        const parsed = GetValidation.safeParse({ tournamentId: id });
        if (!parsed.success) throw new HttpError(parsed.error.message, 400);
        const { tournamentId } = parsed.data;

        const allCategories = await Category.find({ tournament: tournamentId });
        const invalid: Number[] = [];

        for (let category of allCategories) {
            const players = await Player.find({ categories: { $in: category._id } });
            if (category.doubles) {
                if (players.length < 8) {
                    invalid.push(0);
                }
                if (players.length % 2 != 0) {
                    invalid.push(1);
                }
            } else {
                if (players.length < 4) {
                    invalid.push(2);
                }
            }

            if (category.name === "Mixed Doubles") {
                const malePlayers = players.filter((player) => player.male);
                const femalePlayers = players.filter((player) => !player.male);
                if (malePlayers.length != femalePlayers.length) {
                    invalid.push(3);
                }
            }
        }

        return NextResponse.json(invalid, { status: 200 });
    } catch (err:any) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal Server Error" },
            { status: err.statusCode || 500 }
        );
    }
}
