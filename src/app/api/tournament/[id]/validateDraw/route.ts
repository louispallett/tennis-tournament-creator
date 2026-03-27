import objectIdSchema from "@/app/api/objectIdSchema";
import { connectToDB } from "@/lib/db";
import HttpError from "@/lib/HttpError";
import Category from "@/models/Category";
import Match from "@/models/Match";
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

        const categories = await Category.find({ tournament: tournamentId });
        for (const category of categories) {
            const matches = await Match.find({ category: category._id });
            if (matches.length < 1) {
                invalid.push(0);
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
