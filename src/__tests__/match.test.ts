import bcrypt from "bcryptjs";
import Tournament from "@/models/Tournament";
import User from "@/models/User";
import Category from "@/models/Category";
import Match from "@/models/Match";
import { GET, POST } from "@/app/api/match/route";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

describe("API for match route", () => {
    let userId:string;
    let tournamentId:string;
    let categoryId:string;
    beforeEach(async () => {
        const user = await User.create({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            mobCode: "+44",
            mobile: "6701564720",
            password: await bcrypt.hash("HelloWorld1!", 12),
        });

        userId = user._id;

        const tournament = await Tournament.create({
            name: "Test Tournament",
            stage: "sign-up",
            host: user._id,
            code: "tournamentCode",
            stateDate: new Date(),
            showMobile: true,
            seededPlayers: true
        });

        tournamentId = tournament._id;

        const category = await Category.create({
            tournament: tournamentId,
            name: "Men's Singles",
            code: "mSingles",
            locked: false,
            doubles: false
        });

        categoryId = category._id;

    });
    
    describe("Get route", () => {
        beforeEach(async () => {
            await Match.create({
                tournament: tournamentId,
                category: categoryId,
                tournamentRoundText: "2",
                participants: [],
            });
        });

        it("Gets all matches", async () => {
            const res = await GET();
            const json = await res.json();
    
            expect(res.status).toBe(200);
            expect(json[0].tournamentRoundText).toBe("2");
        });
    })


    it("Posts a new match", async () => {
        const req = new Request("http://localhost/api/match", {
            method: "POST",
            body: JSON.stringify({
                tournament: tournamentId,
                category: categoryId,
                matches: [
                    {
                        _id: new mongoose.Types.ObjectId().toHexString(),
                        participants: [],
                        tournamentRoundText: "1",
                        nextMatchId: null,
                        qualifyingMatch: false,
                        date: new Date()
                    }
                ]
            }),
            headers: { "Content-Type": "application/json" }
        });

        const nextRequest = new NextRequest(req);
        const res = await POST(nextRequest);
        const json = await res.json();

        expect(res.status).toBe(201);
        expect(json[0].tournamentRoundText).toBe("1");
        expect(json[0].participants.length).toBe(0);
    });
})
