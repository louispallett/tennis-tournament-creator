import { Types } from "mongoose";

type BaseType = {
    _id: Types.ObjectId | string
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
    host: Types.ObjectId | string,
    code: string,
    startDate: Date,
    showMobile: boolean
};

export interface TournamentTypePopulated extends Omit<TournamentType, "host"> {
    host: Pick<UserType, "_id" | "firstName" | "lastName" | "fullname">,
};

export interface CategoryType extends BaseType {
    tournament: Types.ObjectId | string,
    name: string,
    code: string,
    locked: boolean,
    doubles: boolean,
};

export interface CategoryTypePopulated extends Omit<CategoryType, "tournament"> {
    tournament: Pick<TournamentTypePopulated, "_id" | "host">,
};

export interface PlayerType extends BaseType {
    tournament: Types.ObjectId | string,
    user: Types.ObjectId | string,
    male: boolean,
    categories: Types.ObjectId[] | string[],
    seeded: boolean,
    ranking: number,
};

export interface PlayerTypePopulated extends Omit<PlayerType, "user"> {
    user: Pick<UserType, "firstName" | "lastName">,
};

export interface TeamType extends BaseType {
    tournament: Types.ObjectId | string,
    category: Types.ObjectId | string,
    players: Types.ObjectId[] | string[],
    ranking: number,
};

export interface TeamTypePopulated extends Omit<TeamType, "players"> {
   players: [PlayerTypePopulated, PlayerTypePopulated],
};

interface ParticipantType {
    participantId: Types.ObjectId | string,
    participantModel: string,
    resultText: string,
    isWinner: boolean,
    status: string,
    name: string,
};

export interface MatchTypeLite extends BaseType {
    nextMatchId: string | null,
    previousMatchId?: Types.ObjectId[] | string[],
    tournamentRoundText: string,
    participants: PlayerTypePopulated[] | TeamTypePopulated[],
    qualifyingMatch: boolean,
}

export interface MatchType extends Omit<MatchTypeLite, "participants" | "nextMatchId" | "previousMatchId" > {
    tournament: Types.ObjectId | string,
    category: Types.ObjectId | string,
    nextMatchId: Types.ObjectId | string | null,
    previousMatchId?: Types.ObjectId[] | string[],
    participants: ParticipantType[],
    state: string,
    date: Date,
    updateNumber: Number,
};
