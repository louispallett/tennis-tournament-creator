import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { GET, POST } from "@/app/api/tournament/route";
import Tournament from "@/models/Tournament";
import { NextRequest } from "next/server";

jest.mock("next/headers", () => ({
    cookies: jest.fn()
}));

describe("API for tournament route", () => {
    let id:string;
    beforeEach(async () => {
        const user = await User.create({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            mobCode: "+44",
            mobile: "6701564720",
            password: await bcrypt.hash("HelloWorld1!", 12),
        });

        id = user._id;

        await Tournament.create({
            name: "Test Tournament",
            host: id,
            code: "tournamentCode",
            stateDate: new Date(),
            showMobile: true,
            seededPlayers: true
        });
    });

    it("Gets all tournaments", async () => {
        const res = await GET();
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json[0].name).toBe("Test Tournament");
    });

    it("Creates a new tournament", async () => {
        const token = jwt.sign({ userId: id }, process.env.JWT_SECRET!);
        
        (cookies as jest.Mock).mockReturnValue({
            get: (name: string) => {
                if (name === "token") {
                    return { value: token };
                }
                return undefined;
            }
        });

        const req = new Request("http://localhost/api/tournament", {
            method: "POST",
            body: JSON.stringify({
                name: "New Test Tournament",
                showMobile: true,
                seededPlayers: true,
                categories: ["Men's Singles", "Women's Singles"]
            }),
            headers: { "Content-Type": "application/json" }
        });

        const nextRequest = new NextRequest(req);
        const res = await POST(nextRequest);
        const json = await res.json();

        expect(res.status).toBe(201);
        expect(json.name).toBe("New Test Tournament");
    });
});
