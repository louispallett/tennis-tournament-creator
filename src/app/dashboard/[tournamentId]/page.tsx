import { getMatchesByTournament, getUserMatches } from "@/lib/matches";
import { getPlayerByUser, getPlayersByTournament } from "@/lib/players";
import { getTeamsByTournament, getUserTeams } from "@/lib/teams";
import { getTournamentById } from "@/lib/tournaments";
import { CategoryType, MatchType, PlayerType, TeamType, TournamentType } from "@/lib/types";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
// @ts-ignore - TournamentResults is a .jsx file with no type definitions
import TournamentResults from "./TournamentResults";
import HostSection from "./HostSection";
import { getCategoriesByTournament, getPlayerCategories } from "@/lib/categories";
import UserMatches from "./UserMatches";
import NoInfo from "./NoInfo";
import Link from "next/link";
import { notFound } from "next/navigation";

const getUserId = async ():Promise<any> => {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    const { payload } = await jwtVerify(token!, JWT_SECRET);
    const userId = payload.userId;
    return userId;
}

const getPlayer = async (tournamentId:string, userId:any):Promise<PlayerType> => {
    const player = await getPlayerByUser(tournamentId, userId);
    return player;
}

export default async function Tournament({ params }: { params: { tournamentId: string }}) {
    const { tournamentId } = await params;
    let tournament;
    try {
        tournament = await getTournamentById(tournamentId);
        if (!tournament) {
            notFound();
        }
    } catch(err) {
        console.error("Error fetching tournament: ", err);
        notFound();
    }

    const players = await getPlayersByTournament(tournamentId);
    const matches = await getMatchesByTournament(tournamentId);
    const userId = await getUserId();
    const categories = await getCategoriesByTournament(tournamentId);
    const teams = await getTeamsByTournament(tournamentId);
    const player = await getPlayer(tournamentId, userId);
    // const playerCategories = await getPlayerCategories(player.categories);

    let userTeams = [], userMatches = [];
    if (player) {
        userTeams = await getUserTeams(player._id);
        userMatches = await getUserMatches(player._id, userTeams);
    }
    
    const isHost = tournament.host._id == userId;
    const matchesClient = JSON.parse(JSON.stringify(matches));

    return (
        <div className="flex flex-col gap-5 sm:mx-1.5 lg:mx-5">
            <TournamentInfo tournament={tournament} players={players} matches={matches} />
            { isHost && (
                <HostSection 
                    tournament={tournament} categories={categories} matches={matches} players={players} teams={teams} 
                />
            )}
            {/* <PlayerCategories categories={playerCategories} /> */}
            <div className="racket-cross-wrapper-sm">
                <img src="/assets/images/racket-red.svg" alt="" />
                <img src="/assets/images/racket-blue.svg" alt="" />
            </div>
            <UserTeams teams={userTeams} stage={tournament.stage} />
            <div className="racket-cross-wrapper-sm">
                <img src="/assets/images/racket-red.svg" alt="" />
                <img src="/assets/images/racket-blue.svg" alt="" />
            </div>
            <UserMatches userMatches={JSON.parse(JSON.stringify(userMatches))} stage={tournament.stage} />
            <div className="racket-cross-wrapper-sm">
                <img src="/assets/images/racket-red.svg" alt="" />
                <img src="/assets/images/racket-blue.svg" alt="" />
            </div>
            <TournamentResults matches={matchesClient} stage={tournament.stage} isHost={isHost} />
            <Link href="/dashboard" className="submit text-center">Return to dashboard</Link>
        </div>
    )
}

type TournamentInfoProps = {
    tournament: TournamentType,
    players: PlayerType[],
    matches: MatchType[],
}

function TournamentInfo({ tournament, players, matches }: TournamentInfoProps) {
    return (
        <div className="standard-container bg-lime-400/75">
            <h3>{tournament.name}</h3>
            <div className="tournament-grid-sm">
                <p>Code: {tournament.code}</p>
                <p>Host: {tournament.host.firstName} {tournament.host.lastName}</p>
                <p>Stage: <i>{tournament.stage}</i></p>
                <p>Date Created: {tournament.startDateFormatted}</p>
                <p>Number of players: {players.length}</p>
                <p>Number of active matches: {matches.filter(match => match.state === "SCHEDULED" && match.participants.length > 1).length}</p>
            </div>
        </div>
    )
}

type PlayerCategoriesProps = { categories:CategoryType[] }

function PlayerCategories({ categories }:PlayerCategoriesProps) {
    return (
        <div className="standard-container container-indigo">
            <h3>Your Categories</h3>
            { categories.length > 0 ? (
                <>
                    <p className="my-2.5">You've signed up to the following categories:</p>
                    <div className="tournament-grid-sm">
                            <>
                                { categories.map((category) => (
                                    <p className="standard-container-no-shadow bg-indigo-100 shadow-none lg:text-center"
                                        key={category._id}
                                    >
                                        {category.name}
                                    </p>
                                ))}
                            </>
                    </div>
                </>
            ) : (
                <NoInfo text="You aren't part of any categories" />
            )}
        </div>
    )
}

type UserTeamsProps = {
    teams:TeamType[],
    stage:string
}

function UserTeams({ teams, stage }: UserTeamsProps) {
    return (
        <div className="standard-container container-indigo flex flex-col gap-2.5 z-0">
            <h3>Your Teams</h3>
            { (stage === "play" || stage === "finished") ? (
                <>
                    { teams.length > 0 ? (
                        <>
                            <p>These are the teams you are part of in this tournament</p>
                            <div className="tournament-grid-sm">
                                {teams.map(info => (
                                    <TeamCard info={info} key={info._id} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <NoInfo text="You aren't part of any teams" />
                    )}
                </>
            ): (
                <NoInfo text="Teams will appear here when your host completes the draw" />
            )}      
        </div>
    )
}

type TeamCardProps = {
    info: TeamType
}

function TeamCard({ info }:TeamCardProps) {
    return (
        <div className="standard-container-no-shadow bg-indigo-600/90 max-w-4xl">
            <h5 className="standard-container-no-shadow mb-2.5 text-center bg-lime-400">{info.category.name}</h5>
            <div className="flex justify-between flex-col lg:flex-row items-center gap-2.5">
                <p className="standard-container-no-shadow bg-indigo-100 text-center lg:text-right">{info.players[0].user.firstName} {info.players[0].user.lastName}</p>
                <p className="text-white">and</p>
                <p className="standard-container-no-shadow bg-indigo-100 text-center lg:text-left">{info.players[1].user.firstName} {info.players[1].user.lastName}</p>
            </div>
        </div>    
    )
}
