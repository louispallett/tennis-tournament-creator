import { GET, POST } from "@/app/api/category/route";
import Category from "@/models/Category";
import Tournament from "@/models/Tournament";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

jest.mock("next/headers", () => ({
    cookies: jest.fn()
}));


describe("API for category route", () => {
    let userId:string;
    let tournamentId:string;
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

        await Category.create({
            tournament: tournamentId,
            name: "Men's Singles",
            doubles: false
        });
    });

    it("Gets all categories", async () => {
        const res = await GET();
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json[0].name).toBe("Men's Singles");
    });

    it("Creates a new category", async () => {
        const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET!);
        (cookies as jest.Mock).mockReturnValue({
            get: (name: string) => {
                if (name === "token") {
                    return { value: token };
                }
                return undefined;
            }
        });

        const req = new Request("http://localhost/api/category", {
            method: "POST",
            body: JSON.stringify({
                tournamentId,
                name: "Women's Singles",
            }),
            headers: { "Content-Type": "application/json" }
        });

        const nextRequest = new NextRequest(req);
        const res = await POST(nextRequest);
        const json = await res.json();

        expect(res.status).toBe(201);
        expect(json.name).toBe("Women's Singles");
    })
})
