import { POST } from "@/app/api/auth/route";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

describe("Auth route (Sign in)", () => {
    beforeEach(async () => {
        await User.create({
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            mobCode: "+44",
            mobile: "6701564720",
            password: await bcrypt.hash("HelloWorld1!", 12),
        });
    });
    
    describe("API route for Sign In (correct credentials)", () => {
        it("Should return OK for correct sign in", async () => {
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
    
            expect(res.status).toBe(200);
        });
    });
    
    describe("API route for Sign In (incorrect credentials)", () => {
        it("Should return 401 with incorrect email", async () => {
            const req = new Request("http:localhost/api/auth", {
                method: "POST",
                body: JSON.stringify({
                    email: "Jon.Doe@example.com",
                    password: "HelloWorld2!"
                }),
                headers: { "Content-Type": "application/json" }
            });
    
            const nextRequest = new NextRequest(req);
            const res = await POST(nextRequest);
            const json = await res.json();
    
            expect(res.status).toBe(401);
            expect(json.message).toBe("Invalid Credentials");
        });
    
        it("Should return 401 with incorrect password", async () => {
            const req = new Request("http:localhost/api/auth", {
                method: "POST",
                body: JSON.stringify({
                    email: "john.doe@example.com",
                    password: "HelloWorld1"
                }),
                headers: { "Content-Type": "application/json" }
            });
        
            const nextRequest = new NextRequest(req);
            const res = await POST(nextRequest);
            const json = await res.json();
        
            expect(res.status).toBe(401);
            expect(json.message).toBe("Invalid Credentials");
        });

        /* Rate Limiter Test
         * ------------------
         *
         *  Designed to ensure 429 error on repeated requests.
         *
         *  Not the most elegant, but handles basic brute force.
         *
         * -------------------
         */

        it("Should return 429 on repeated attempts", async () => {
            const req = new Request("http:localhost/api/auth", {
                method: "POST",
                body: JSON.stringify({
                    email: "john.doe@example.com",
                    password: "HelloWorld1"
                }),
                headers: { 
                  "Content-Type": "application/json",
                  "x-forwarded-for": "127.0.0.1" 
                }
            });
        
            const nextRequest = new NextRequest(req);

            for (let i = 0; i < 10; i++) {
                await POST(nextRequest);
            }
            
            const res = await POST(nextRequest);
            expect(res.status).toBe(429);
        });
    });
})
