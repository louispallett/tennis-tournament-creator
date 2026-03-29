import { Types } from "mongoose";

type BaseType = {
    _id: string
};

export interface UserType extends BaseType {
    firstName: string,
    lastName: string,
    email: string,
    mobCode:string,
    mobile:string,
    password: string,
    fullname: string
}

export interface TournamentType extends BaseType {
    name: string,
    stage: string,
    host: Types.ObjectId,
    code: string,
    startDate: Date,
    showMobile: boolean
};

export interface TournamentTypePopulated extends Omit<TournamentType, "host"> {
    host: Pick<UserType, "_id" | "firstName" | "lastName" | "fullname">,
};

export interface CategoryType extends BaseType {
    tournament: Types.ObjectId,
    name: string,
    code: string,
    locked: boolean,
    doubles: boolean,
};

export interface CategoryTypePopulated extends Omit<CategoryType, "tournament"> {
    tournament: Pick<TournamentTypePopulated, "_id" | "host">,
};

export interface PlayerType extends BaseType {
    tournament: Types.ObjectId,
    user: Types.ObjectId,
    male: boolean,
    categories: Types.ObjectId[],
    seeded: boolean,
    ranking: number,
};

export interface PlayerTypePopulated extends Omit<PlayerType, "user"> {
    user: Pick<UserType, "firstName" | "lastName" | "fullname">,
};

export interface TeamType extends BaseType {
    tournament: Types.ObjectId,
    category: Types.ObjectId,
    players: [Types.ObjectId, Types.ObjectId],
    ranking: number,
};

export interface TeamTypePopulated extends Omit<TeamType, "players"> {
   players: [PlayerTypePopulated, PlayerTypePopulated],
};

interface ParticipantType {
    participantId: Types.ObjectId,
    participantModel: string,
    resultText: string,
    isWinner: boolean,
    status: string,
    name: string,
};

export interface MatchTypeLite extends BaseType {
    nextMatchId: string | null,
    previousMatchId?: string[],
    tournamentRoundText: string,
    participants: PlayerTypePopulated[] | TeamTypePopulated[],
    qualifyingMatch: boolean,
}

export interface MatchType extends Omit<MatchTypeLite, "participants" | "nextMatchId" | "previousMatchId" > {
    tournament: Types.ObjectId,
    category: Types.ObjectId,
    nextMatchId: Types.ObjectId,
    previousMatchId?: Types.ObjectId[],
    participants: ParticipantType[],
    state: string,
    date: Date,
    updateNumber: Number,
};
