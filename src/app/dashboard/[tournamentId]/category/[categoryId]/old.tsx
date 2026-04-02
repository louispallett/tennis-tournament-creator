import { getCategoryInfo } from "@/lib/categories"
import { getMatchesByCategory } from "@/lib/matches";
import { getPlayersByCategory, toPlayerClient } from "@/lib/players";
import { getTeamsByCategory, toTeamClient } from "@/lib/teams";
import { getTournamentById } from "@/lib/tournaments";
import { CategoryType, MatchType, MatchTypeLite, PlayerType, TeamType, TournamentType } from "@/lib/types";
import Link from "next/link";
import GenerateMatches from "./GenerateMatches";
import RemovePlayers from "./RemovePlayers";
import CreateTeams from "./CreateTeams";
import StagePlay from "./StagePlay.tsx";
import { notFound } from "next/navigation";

type CategoryPageProps = {
    params: {
        tournamentId:string,
        categoryId:string
    }
}

export default async function CategoryPage({ params }:CategoryPageProps) {
    const {tournamentId, categoryId } = await params;

    let tournament, category;
    try {
        tournament = await getTournamentById(tournamentId);
        category = await getCategoryInfo(categoryId);
        if (!tournament || !category) {
            notFound();
        }
    } catch(err) {
        console.error("Error fetching data: ", err);
        notFound();
    }
    
    const players = await getPlayersByCategory(categoryId);
    const matches = await getMatchesByCategory(categoryId);
    const teams = await getTeamsByCategory(categoryId);

    return (
        <div className="flex flex-col gap-5 sm:mx-1.5 lg:mx-5">
            <div className="standard-container bg-lime-400">
                <h3>{category.name}</h3>
            </div>
            <CategoryInfo category={category} players={players} matches={matches} teams={teams} />
            <Actions tournament={tournament} category={category} teams={teams} players={players} matches={matches} />
            {/* <DangerZone /> */}
            <Link href={`/dashboard/${tournamentId}`}>
                <button className="submit">
                    Back to Tournament Page
                </button>
            </Link>
        </div>
    )
}

type CategoryInfoProps = {
    category:CategoryType,
    players:PlayerType[],
    matches:MatchType[],
    teams:TeamType[]
}

function CategoryInfo({ category, players, matches, teams }:CategoryInfoProps) {
    const noOfMales = players.filter(player => player.male).length;
    const seeded = players.filter(player => player.seeded).length;

    return (
        <div className="standard-container bg-slate-100 flex flex-col gap-2.5">
            <h3>Category Information</h3>
            <div className="tournament-grid-sm">
                <p className="standard-container-no-shadow">Number of players: {players.length}</p>
                <p className="standard-container-no-shadow">Number of active matches: {matches.filter(match => match.state === "SCHEDULED").length}</p>
                <p className="standard-container-no-shadow">Males: {noOfMales}</p>
                <p className="standard-container-no-shadow">Females: {players.length - noOfMales}</p>
                <p className="standard-container-no-shadow">Seeded: {seeded}</p>
                <p className="standard-container-no-shadow">Non-Seeded: {players.length - seeded}</p>
            </div>
            <div className="standard-container bg-indigo-500">
                <h4 className="text-white">Players</h4>
                { players.length < 1 ? (
                    <div className="standard-container bg-slate-100 flex flex-col gap-2.5 justify-center items-center">
                        <div className="racket-cross-wrapper">
                            <img src="/assets/images/racket-red.svg" alt="" />
                            <img src="/assets/images/racket-blue.svg" alt="" />
                        </div>
                        <h4>No players yet!</h4>
                    </div>
                ) : (
                    <div className="tournament-grid-sm">
                        { players.map((player) => (
                            <PlayerCard info={player} key={player._id} />
                        ))}
                    </div>
                )}
            </div>
            { category.doubles && (
                <>
                    { teams.length > 0 && (
                        <div className="standard-container bg-indigo-500">
                            <h4 className="text-white">Teams</h4>
                            <div className="tournament-grid-sm">
                                { teams.map((team) => (
                                    <TeamCard info={team} key={team._id} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

type PlayerCardProps = { info:PlayerType }

function PlayerCard({ info }:PlayerCardProps) {
    return (
        <div className="standard-container-no-shadow bg-slate-100">
            <p>{info.user.firstName} {info.user.lastName}</p>
            <p>Gender: {info.male ? "male" : "female"}</p>
            <p>Seeded: {info.seeded ? "yes" : "no"}</p>
            <p>Ranking: {info.ranking === 0 ? "Not assigned" : info.ranking}</p>
        </div>
    )
}

type TeamCardProps = { info:TeamType }

function TeamCard({ info }:TeamCardProps) {
    return (
        <div className="standard-container-no-shadow bg-slate-100">
            <p>{info.players[0].user.firstName} {info.players[0].user.lastName}</p>
            <p>{info.players[1].user.firstName} {info.players[1].user.lastName}</p>
            <p>Ranking: {info.ranking === 0 ? "Not assigned" : info.ranking}</p>
        </div>
    )
}

type ActionProps = {
    tournament:TournamentType,
    category:CategoryType,
    teams:TeamType[],
    players:PlayerType[],
    matches:MatchType[]
}

function Actions({ tournament, category, teams, players, matches }:ActionProps) {
    const stage:string = tournament.stage;
  
    // Filter out matches array to just include those matches which are ready to play:
    const matchesFiltered:MatchType[] = matches.filter((match:MatchType) => (
        match.participants.length > 1 && match.state === "SCHEDULED"
    ));
    const matchesClient:MatchType[] = JSON.parse(JSON.stringify(matchesFiltered));

    return (
        <div className="standard-container-no-shadow bg-slate-100 flex flex-col gap-2.5">
            <h3>Category Operations: {stage.toUpperCase()}</h3>
            { stage === "sign-up" && (
                <StageSignUp tournament={tournament} category={category} teams={teams} players={players} />
            )}
            { stage === "draw" && (
                <StageDraw tournament={tournament} category={category} teams={teams} players={players} />
            )}
            { stage === "play" && (
                <StagePlay matches={matchesClient} />
            )}
            { stage === "finished" && (
                <StageFinished />
            )}
        </div>
    )
}

function StageSignUp({ tournament, category, players }:ActionProps) {
    const clientPlayers = players.map(toPlayerClient);
    return (
        <>
            <h4>Creating Matches & Teams</h4>
            <p>
                Registration is open. This means players can join up using the tournament code <b>{tournament.code}</b>. On this 
                page, you'll be able to see who has currently signed up to this tournament. You can remove players from the category below.
            </p>
            <RemovePlayers players={clientPlayers} categoryId={JSON.parse(JSON.stringify(category._id))} />
        </>
    )    
}

function StageDraw({ tournament, category, teams, players }:ActionProps) {
    const teamCreation:boolean = category.doubles && teams.length < 1;

    let clientPlayers;

    // TODO: This is actually necessary - we basically want to pass two possible options into one variable!
    if (teamCreation) {
        clientPlayers = players.map(toPlayerClient);
    } else {
        if (category.doubles) {
            clientPlayers = teams.map(toTeamClient);
        } else {
            clientPlayers = players.map(toPlayerClient);
        }
    }

    const categoryLocked:boolean = category.locked;

    return (
        <>
            <h4>Creating Matches & Teams</h4>
            <p>Now that registration for this tournament is closed, you can create the matches and teams.</p>
            { !categoryLocked ? (
                <>
                    { teamCreation ? (
                        <>
                            <p className="mb-2.5">
                                Since this is a doubles category, you'll first need to create the teams. This works by randomizing the players and then pairing them together.
                                If this category has seeded players, each seeded player will be matched with a non-seeded player until there are none left, and the remaining 
                                non-seeded players will be matched together.
                            </p>
                            <CreateTeams category={JSON.parse(JSON.stringify(category))} players={clientPlayers}  />
                        </>
                    ) : (
                        <GenerateMatches participants={clientPlayers} categoryId={category._id.toString()} doubles={category.doubles} />
                    )}
                    <RemovePlayers players={clientPlayers} categoryId={JSON.parse(JSON.stringify(category._id))} />
                </>
            ) : (
                <p>Looks like you've created matches for this category! Once you have created matches for each category, return to the tournament page and move to the PLAY stage.</p>
            )}
        </>
    )
}

function StageFinished() {
    return (
        <p>This tournament is finished.</p>
    )
}

// Both below will have to be client components
function DangerZone() {

}
function DeleteDialog() {
    
}
