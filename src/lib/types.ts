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
    host: string,
    code: string,
    startDate: Date,
    showMobile: boolean
};

export interface TournamentTypePopulated extends Omit<TournamentType, "host"> {
    host: Pick<UserType, "_id" | "firstName" | "lastName" | "fullname">,
};

export interface CategoryType extends BaseType {
    tournament: string,
    name: string,
    code: string,
    locked: boolean,
    doubles: boolean,
};

export interface CategoryTypePopulated extends Omit<CategoryType, "tournament"> {
    tournament: Pick<TournamentTypePopulated, "_id" | "host">,
};

export interface PlayerType extends BaseType {
    tournament: string,
    user: string,
    male: boolean,
    categories: string[],
    seeded: boolean,
    ranking: number,
};

export interface PlayerTypePopulated extends Omit<PlayerType, "user"> {
    user: Pick<UserType, "firstName" | "lastName">,
};

export interface TeamType extends BaseType {
    tournament: string,
    category: string,
    players: string[],
    ranking: number,
};

export interface TeamTypePopulated extends Omit<TeamType, "players"> {
   players: [PlayerTypePopulated, PlayerTypePopulated],
};

export interface ParticipantType extends BaseType {
    participantId: string,
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
    tournament: string,
    category:  string,
    nextMatchId: string | null,
    previousMatchId?: string[],
    participants: ParticipantType[],
    state: string,
    date: Date,
    updateNumber: Number,
};
