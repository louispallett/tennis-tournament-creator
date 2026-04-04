import Match from "@/models/Match";
import { connectToDB } from "./db";
import { MatchType, MatchTypeLite, ParticipantType, PlayerType, TeamType } from "./types";
import Category from "@/models/Category";

export async function getMatchesByTournament(tournamentId:string):Promise<MatchType[]> {
    await connectToDB();

    const matches = await Match.find({ tournament:tournamentId })
        .populate({ 
            path: "category", 
            select: "name -_id", 
            model: Category 
        });

    return matches;
}

export async function getMatchesByCategory(categoryId:string):Promise<MatchType[]> {
    await connectToDB();

    const matches = await Match.find({ category: categoryId })
        .populate({ path: "category", select: "name", model: Category });
    return matches;
}

export async function getUserMatches(playerId:string, userTeams:TeamType[]):Promise<MatchType[]> {
    await connectToDB();

    const userTeamsIds = userTeams.map(item => item._id);
    const idsToCheck = [playerId, ...userTeamsIds];
    const matches = await Match.find({ 
        state: 'SCHEDULED', 
        'participants.participantId': { $in: idsToCheck }
    }).populate({ 
        path: "category", 
        select: "name",
        model: Category
    });
    return matches;
}

export async function getAllUserMatches(players:PlayerType[], userTeams:TeamType[]):Promise<MatchType[]> {
    await connectToDB();

    const userTeamsIds = userTeams.map(item => item._id);
    const playerIds = players.map(item => item._id)
    const idsToCheck = [...playerIds, ...userTeamsIds];
    const matches = await Match.find({
        'participants.participantId': { $in: idsToCheck }
    }).populate({ 
        path: "category", 
        select: "name",
        model: Category
    });
    return matches;
}

export function convertToMatch(
    match: MatchTypeLite, 
    tournament: string, 
    category: string,
    participants: ParticipantType[],
    state: string,
    date: Date,
    updateNumber: number
): MatchType {
    return ({
        ...match,
        tournament,
        category,
        participants,
        state,
        date,
        updateNumber,
    });
}
