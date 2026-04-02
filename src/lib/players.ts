import Player from "@/models/Player";
import { PlayerType, PlayerTypePopulated } from "./types";
import User from "@/models/User";
import { connectToDB } from "./db";

export async function getPlayer(playerId:string):Promise<PlayerType[]> {
    await connectToDB();
    const player = await Player.findById(playerId)
        .populate({ path: "user", select: "firstName lastName -_id", model: User });
    return player;
}

export async function getAllPlayersByUser(userId:string):Promise<PlayerType[]> {
    await connectToDB();
    const player = await Player.find({ user: userId });
    return player;
}

export async function getPlayersByTournament(tournamentId:string):Promise<PlayerType[]> {
    await connectToDB();
    const players = await Player.find({ tournament: tournamentId })
        .populate({ path: "user", select: "firstName lastName -_id", model: User })
        .sort("ranking");

    return players;
}

export async function getPlayersByCategory(categoryId:string):Promise<PlayerType[]> {
    await connectToDB();
    const players = await Player.find({ categories: { $in: [categoryId] } })
        .sort("ranking");
        
    return players;
}

export async function getPopulatedPlayersByCategory(categoryId: string): Promise<PlayerTypePopulated[]> {
    await connectToDB();
    const players = await Player.find({ categories: { $in: [categoryId] } })
        .populate({ path: "user", select: "firstName lastName -_id", model: User })
        .sort("ranking");
        
    return players;
}

export async function getPlayerByUser(tournamentId:string, userId:any):Promise<PlayerType> {
    await connectToDB();
    const player = await Player.findOne({ tournament: tournamentId, user: userId });
    return player;
}

// export function toPlayerClient(player: PlayerType):PlayerTypeClient {
//     return {
//         _id: player._id.toString(),
//         tournament: typeof player.tournament === "string" 
//             ? player.tournament 
//             : player.tournament._id.toString(),
//         user: {
//             firstName: (player.user as any).firstName,
//             lastName: (player.user as any).lastName,
//         },
//         male: player.male,
//         categories: player.categories.map(cat =>
//             typeof cat === "string" ? cat : cat._id.toString()
//         ),
//         seeded: player.seeded,
//         ranking: player.ranking,
//     }
// }

export async function checkPlayerRankings(tournamentId:string): Promise<PlayerType[]> {
    await connectToDB();
    const players = await Player.find({ tournament: tournamentId })
        .sort("ranking");

    const zeroPlayers = players.filter(player => player.ranking == 0);
    return zeroPlayers;
}
