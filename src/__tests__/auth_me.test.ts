import { GET } from "@/app/api/auth/me/route";
import { POST } from "@/app/api/auth/route";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

describe("Auth ME route (authentication)", () => {
    let token:string;
    beforeEach(async () => {
        await User.create({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            mobCode: "+44",
            mobile: "6701564720",
            password: await bcrypt.hash("HelloWorld1!", 12),
        });

        const req = new Request("http:localhost/api/auth", {
            method: "POST",
            body: JSON.stringify({
                email: "john.doe@example.com",
                password: "HelloWorld1!"
            }),
            headers: { "Content-Type": "application/json" }
        });

        const nextRequest = new NextRequest(req);
        const res = await POST(nextRequest);
        const json = await res.json();

        token = json.token;
    });

    it("Successful on valid JWT", async () => {
        const cookieHeader = `token=${token}`;
        const req = new Request("http://localhost/api/auth/me", {
            method: "GET",
            headers: {
                cookie: cookieHeader,
            },
        });

        const nextReq = new NextRequest(req);

        const res = await GET(nextReq);
        expect(res.status).toBe(200);
    });

    it("Unsuccessful on invalid JWT", async () => {
        const invalidToken = "an.invalid.token";
        const cookieHeader = `token=${invalidToken}`;
        
        const req = new Request("http://localhost/api/auth/me", {
            method: "GET",
            headers: {
                cookie: cookieHeader,
            },
        });

        const nextReq = new NextRequest(req);

        const res = await GET(nextReq);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.message).toBe("Invalid token");
    });
});
