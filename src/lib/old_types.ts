import { Types } from "mongoose";

export interface CategoryType {
    _id:string,
    tournament:Types.ObjectId | TournamentType,
    name:string,
    code:string,
    locked:boolean,
    doubles:boolean
};

export interface CategoryTypePopulated extends Omit<CategoryType, "tournament"> {
   tournament: {
      name: string,
      stage: string,
      host: Pick<UserType, "firstName" | "lastName">,
      code: string,
      startDate: Date,
      showMobile: boolean
   } 
};

export interface MatchType {
    _id:string,
    tournament:Types.ObjectId | TournamentType,
    category:Types.ObjectId | CategoryType,
    nextMatchId:Types.ObjectId | MatchType | null,
    previousMatchId:Types.ObjectId[] | MatchType[],
    tournamentRoundText:string,
    state:"SCHEDULED" | "NO_SHOW" | "WALK_OVER" | "NO_PARTY" | "DONE" | "SCORE_DONE",
    participants:ParticipantType[], // Explicit and unique to MatchType
    date?:Date | null,
    updateNumber:number,
    qualifyingMatch?:boolean
};

interface ParticipantType {
    _id:string,
    participantModel:"Player" | "Team",
    resultText:string,
    isWinner:boolean,
    status:string | null,
    name:string
};

// export interface MatchTypeLite {
//     _id:string,
//     nextMatchId:string | null,
//     previousMatchId?:string[]
//     tournamentRoundText:string,
//     participants:PlayerType[] | TeamType[],
//     qualifyingMatch:boolean,
// };

export interface MatchTypeLite extends Omit<MatchType, "tournament" | "category" | "nextMatchId" | "previousMatchId" | "participants" | "date" | "updateNumber"> {
    nextMatchId:string | null,
    previousMatchId?:string[]
    participants:PlayerType[] | TeamType[],
}

export interface PlayerType {
    _id:string,
    tournament:Types.ObjectId | TournamentType,
    user:Types.ObjectId | UserType,
    male:boolean,
    categories:Types.ObjectId[] | CategoryType[],
    seeded:boolean,
    ranking:number
};

// export interface PlayerTypeClient {
//     _id:string,
//     tournament:string
//     user: {
//         firstName:string,
//         lastName:string
//     }
//     male:boolean,
//     categories:string[]
//     seeded?:boolean,
//     ranking:number
// }

export interface PlayerTypeClient extends Omit<PlayerType, "user"> {
    user: Pick<UserType, "firstName" | "lastName">
}

export interface TeamType {
    _id:string,
    tournament:Types.ObjectId | TournamentType,
    category:Types.ObjectId | CategoryType,
    players:Types.ObjectId[] | PlayerType[],
    ranking:number
};

// export interface TeamTypeClient {
//     _id:string,
//     category:string
//     players: {
//         _id:string,
//         user: {
//             firstName:string,
//             lastName:string
//         },
//         ranking:number
//     }
//     ranking:number
// };

export interface TeamTypeClient extends Omit<TeamType, "tournament" | "category" | "players"> {
    category: string;
    players: Pick<PlayerType, "_id" | "user">[];
}

export interface TournamentType {
    _id:string,
    name:string,
    stage:string,
    host:Types.ObjectId | UserType,
    code:string,
    startDate:Date,
    showMobile:boolean,
    startDateFormatted:string,
}

// export interface TournamentTypeAdvanced {
//     _id:string,
//     name:string,
//     stage:string,
//     host:{
//         firstName:string,
//         lastName:string
//     },
//     code:string,
//     startDate:Date,
//     showMobile:boolean,
//     startDateFormatted:string,
// }

export interface TournamentTypeAdvanced extends Omit<TournamentType, "host"> {
    host: Pick<UserType, "firstName" | "lastName">,
}

export interface UserType {
    _id:string,
    firstName:string,
    lastName:string,
    email:string,
    mobCode:string,
    mobile:string,
    password:string
};
