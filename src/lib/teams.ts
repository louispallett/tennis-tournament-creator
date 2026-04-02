import Player from "@/models/Player";
import Team from "@/models/Team";
import User from "@/models/User";
import { PlayerTypePopulated, TeamType, TeamTypePopulated } from "./types";
import { connectToDB } from "./db";
import Category from "@/models/Category";
import HttpError from "./HttpError";

export async function getTeam(teamId: string): Promise<TeamType> {
    await connectToDB();

    const team = await Team.findById(teamId);
    if (!team) {
        throw new HttpError("Team not found");
    }

    return team;
}

export async function getTeamPopulated(teamId:string):Promise<TeamTypePopulated> {
    await connectToDB();
    const team = await Team.findById(teamId)
        .populate({ path: "players", model: Player, 
            populate: [{
                path: "user",
                select: "-password",
                model: User
            }]
        });
    return team;
}

export async function getTeamsByTournament(tournamentId:string):Promise<TeamType[]> {
    await connectToDB();
    const teams = await Team.find({ tournament: tournamentId }).sort("ranking");
    return teams;
}

export async function getTeamsByCategory(categoryId:string):Promise<TeamType[]> {
    await connectToDB();
    const teams = await Team.find({ category: categoryId })
        .sort("ranking");
    return teams;
}

export async function getPopulatedTeamsByCategory(categoryId:string):Promise<TeamTypePopulated[]> {
    await connectToDB();
    const teams = await Team.find({ category: categoryId })
        .populate({ path: "players", model: Player, 
            populate: [{
                path: "user",
                select: "firstName lastName -_id",
                model: User
            }]
        }).sort("ranking");

    return teams;
}

export async function getUserTeams(playerId:string):Promise<TeamType[]> {
    await connectToDB();

    const teams = await Team.find({ players: playerId });
    return teams;
}

export async function getUserTeamsPopulated(playerId:string):Promise<TeamTypePopulated[]> {
    await connectToDB();
    const teams = await Team.find({ players: playerId })
        .populate({ path: "category", model: Category })
        .populate({ path: "players", model: Player, 
            populate: [{
                path: "user",
                select: "-password",
                model: User
            }]
        });
    return teams;
}

// export function toTeamClient(team:TeamTypePopulated):TeamTypeClient {
//     return {
//         _id: team._id.toString(),
//         category: typeof team.category === "string"
//             ? team.category
//             : team.category._id.toString(),
//         players: team.players.map((player: PlayerTypePopulated) =>
//             typeof player === "string"
//                 ? { 
//                     _id: player, 
//                     user: { firstName: "", lastName: "" }, 
//                     ranking: 0 
//                 }
//                 : {
//                     _id: player._id.toString(),
//                     user: {
//                         firstName: player.user.firstName,
//                         lastName: player.user.lastName
//                     },
//                     ranking: player.ranking
//                 }
//         ),
//         ranking: team.ranking,
//     };
// }
