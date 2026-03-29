import { generateMatches } from "@/lib/generateMatches";
import { PlayerTypePopulated } from "@/lib/types";
import { Types } from "mongoose";

const generatePlayer = (i: number): PlayerTypePopulated => {
    return {
        _id: i.toString(),
        tournament: new Types.ObjectId(),
        user: {
            firstName: i.toString(),
            lastName: "",
            fullname: i.toString()
        },
        male: true,
        categories: [],
        seeded: false,
        ranking: i
    }
}

const createPlayers = (n:number): PlayerTypePopulated[] => {
    const result: PlayerTypePopulated[] = [];
    for (let i = 1; i <= n; i++) {
        result.push(generatePlayer(i));

    }
    return result;
}

describe("Generating Matches", () => {
    it("Returns the correct number of rounds", () => {
        expect(generateMatches(createPlayers(16))[0].tournamentRoundText).toBe("4");
        expect(generateMatches(createPlayers(17))[0].tournamentRoundText).toBe("5");
        expect(generateMatches(createPlayers(31))[0].tournamentRoundText).toBe("5");
    });

    it("Assigns nextMatchIds to normal matches correctly", () => {
        const matches = generateMatches(createPlayers(8));
        expect(matches[1].nextMatchId).toBe(matches[0]._id);
        expect(matches[2].nextMatchId).toBe(matches[0]._id);
        expect(matches[3].nextMatchId).toBe(matches[1]._id);
        expect(matches[6].nextMatchId).toBe(matches[1]._id);
    })

    it("Assigns nextMatchIds to qualifying matches correctly", () => {
        const matches = generateMatches(createPlayers(15));
        expect(matches[7].nextMatchId).toBe(matches[4]._id)
        expect(matches[8].nextMatchId).toBe(matches[5]._id)
        expect(matches[9].nextMatchId).toBe(matches[6]._id)
        expect(matches[10].nextMatchId).toBe(matches[6]._id)
        expect(matches[11].nextMatchId).toBe(matches[5]._id)
        expect(matches[12].nextMatchId).toBe(matches[4]._id)
        expect(matches[13].nextMatchId).toBe(matches[3]._id)
    })
});

describe("Assigning players", () => {
    describe("Normal (^2) tournament", () => {
        const matches = generateMatches(createPlayers(32));

        it("Participants assigned correctly", () => {
            expect(matches[15].participants[0].ranking).toEqual(1);
            expect(matches[15].participants[1].ranking).toEqual(32);
            expect(matches[16].participants[0].ranking).toEqual(2);
            expect(matches[16].participants[1].ranking).toEqual(31);
            expect(matches[30].participants[0].ranking).toEqual(16);
            expect(matches[30].participants[1].ranking).toEqual(17);
        });
    });
    
    describe("Single qualifying matches (10 players)", () => {
        const matches = generateMatches(createPlayers(10));
        const qualifyingRound = matches.slice(7);
        const firstRound = matches.slice(3, 7);
        
        it("Participants assigned correctly", () => {
            expect(qualifyingRound[0].participants.length).toBe(2);
            expect(qualifyingRound[1].participants.length).toBe(2);
            expect(firstRound[0].participants.length).toBe(1);
            expect(firstRound[1].participants.length).toBe(1);
            expect(firstRound[0].participants[0].ranking).toEqual(1);
            expect(firstRound[2].participants[0].ranking).toEqual(3);            
            expect(firstRound[2].participants[1].ranking).toEqual(6);
        });
    });

    describe("Double qualifying matches (15 players)", () => {
        const matches = generateMatches(createPlayers(15));
        const qualifyingRound = matches.slice(7);
        const firstRound = matches.slice(3, 7);
        it("Participants assigned correctly", () => {
            expect(qualifyingRound[0].participants.length).toBe(2);
            expect(qualifyingRound[1].participants.length).toBe(2);
            expect(qualifyingRound[6].participants[0].ranking).toEqual(15);
            expect(qualifyingRound[6].participants[1].ranking).toEqual(8);
            expect(firstRound[0].participants.length).toBe(1);
            expect(firstRound[1].participants.length).toBe(0);
            expect(firstRound[0].participants[0].ranking).toEqual(1);
            expect(firstRound[2].participants).toEqual([]);    
        });
    });
});
