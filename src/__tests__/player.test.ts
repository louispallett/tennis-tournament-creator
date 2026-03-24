import { GET, POST } from "@/app/api/player/route";
import Category from "@/models/Category";
import jwt from "jsonwebtoken";
import Player from "@/models/Player";
import Tournament from "@/models/Tournament";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

jest.mock("next/headers", () => ({
    cookies: jest.fn()
}));

describe("API for player route", () => {
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
            host: userId,
            code: "tournamentCode",
            showMobile: true,
            seededPlayers: true
        });

        tournamentId = tournament._id;

        const category = await Category.create({
            tournament: tournamentId,
            name: "Men's Singles",
            doubles: false
        });

        categoryId = category._id
    });

    describe("Get block", () => {
        beforeEach(async () => {
            await Player.create({
                tournament: tournamentId,
                user: userId,
                male: true,
                categories: [categoryId],
                seeded: true,
            });
        });

        it("Gets all players", async () => {
            const res = await GET();
            const json = await res.json();
    
            expect(res.status).toBe(200);
            expect(json[0].male).toBeTruthy();
        });
    })


    it("Creates a new player", async () => {
        const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET!);
        (cookies as jest.Mock).mockReturnValue({
            get: (name: string) => {
                if (name === "token") {
                    return { value: token };
                }
                return undefined;
            }
        });

        const req = new Request("http://localhost/api/player", {
            method: "POST",
            body: JSON.stringify({
                tournamentId,
                gender: "male",
                seeded: false,
                categories: ["Men's Singles"],
            }),
            headers: { "Content-Type": "application/json" }
        });

        const nextRequest = new NextRequest(req);
        const res = await POST(nextRequest);
        const json = await res.json();

        expect(res.status).toBe(201);
        expect(json.male).toBeTruthy();
    });
});
