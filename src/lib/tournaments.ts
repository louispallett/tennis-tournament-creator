import Tournament from "@/models/Tournament";
import { TournamentType, TournamentTypePopulated } from "./types";
import User from "@/models/User";
import { DateTime } from "luxon";
import { connectToDB } from "./db";
import Player from "@/models/Player";
import HttpError from "./HttpError";

export async function getTournamentById(tournamentId:string): Promise<TournamentTypePopulated> {
    await connectToDB();

    const tournament = await Tournament.findById(tournamentId)
        .populate({ path: "host", select: "firstName lastName", model: User });

    if (!tournament) {
        throw new HttpError("Not found", 404);
    }

    tournament.startDateFormatted = DateTime.fromJSDate(tournament.startDate).toLocaleString(DateTime.DATE_MED);

    return tournament;
}

export async function getUserTournaments(userId:string): Promise<TournamentType[][]> {
    await connectToDB();

    const tournamentsHosting = await Tournament.find({ host: userId })
        .populate({
            path: "host",
            select: "firstName lastName",
            model: User
        });;
    const players = await Player.find({ user: userId });
    const tournamentsPlaying = [];
    for (let player of players) {
        const tournament = await Tournament.findById(player.tournament)
            .populate({
                path: "host",
                select: "firstName lastName",
                model: User
            });
        tournamentsPlaying.push(tournament);
    }

    const result = [[...tournamentsHosting], [...tournamentsPlaying]];
    return result;
}

export async function getTournamentByCode(code:string): Promise<TournamentType> {
    await connectToDB();

    const tournament = await Tournament.findOne({ code })
        .populate({ path: "host", select: "firstName lastName", model: User });
    
    if (!tournament) throw new HttpError("Tournament not found", 401);
    if (tournament.stage != "sign-up") throw new HttpError("Tournament registration closed", 401)

    return tournament;
}
