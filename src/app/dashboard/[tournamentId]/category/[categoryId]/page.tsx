import { getCategoryPopulated } from "@/lib/categories";
import { getMatchesByCategory } from "@/lib/matches";
import { getPopulatedPlayersByCategory } from "@/lib/players";
import { getTournamentById } from "@/lib/tournaments";
import { getPopulatedTeamsByCategory } from "@/lib/teams";
import { CategoryTypePopulated, MatchType, PlayerTypePopulated, TeamTypePopulated, TournamentType } from "@/lib/types";
import { notFound } from "next/navigation";
import GenerateMatches from "./GenerateMatches";
import RemovePlayers from "./RemovePlayers";
import CreateTeams from "./CreateTeams";
import StagePlay from "./StagePlay";
import Link from "next/link";

type CategoryPageProps = {
    params: {
        tournamentId:string,
        categoryId:string
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { tournamentId, categoryId } = await params;

    const tournament = await getTournamentById(tournamentId);
    const category = await getCategoryPopulated(categoryId);

    if (!tournament || !category) {
        notFound();
    }

    const players = await getPopulatedPlayersByCategory(categoryId);
    const matches = await getMatchesByCategory(categoryId);
    const teams = await getPopulatedTeamsByCategory(categoryId);

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
    );
}

type CategoryInfoProps = {
    category:CategoryTypePopulated,
    players:PlayerTypePopulated[],
    matches:MatchType[],
    teams:TeamTypePopulated[]
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
    );
}

type PlayerCardProps = { info:PlayerTypePopulated }

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

type TeamCardProps = { info:TeamTypePopulated }

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
    category:CategoryTypePopulated,
    teams:TeamTypePopulated[],
    players:PlayerTypePopulated[],
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
                <StageSignUp tournament={tournament} />
            )}
            { stage === "draw" && (
                <StageDraw category={category} teams={teams} players={players} />
            )}
            { stage === "play" && (
                <StagePlay matches={matchesClient} />
            )}
            { stage === "finished" && (
                <StageFinished />
            )}

        </div>
    );
}

type StageSignUpProps = {
    tournament:TournamentType,
}

function StageSignUp({ tournament }:StageSignUpProps) {
    return (
        <>
            <h4>Creating Matches & Teams</h4>
            <p>
                Registration is open. This means players can join up using the tournament code <b>{tournament.code}</b>. On this 
                page, you'll be able to see who has currently signed up to this tournament. You can remove players from the category below.
            </p>
        </>
    )    
}

type StageDrawProps = {
    category: CategoryTypePopulated,
    teams: TeamTypePopulated[],
    players: PlayerTypePopulated[]
}

function StageDraw({ category, teams, players }: StageDrawProps) {
    const teamCreation:boolean = category.doubles && teams.length < 1;

    let clientPlayers: PlayerTypePopulated[] | TeamTypePopulated[] = players;

    if (category.doubles && teams.length > 0) {
        clientPlayers = teams;
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
                            <CreateTeams category={JSON.parse(JSON.stringify(category))} players={players}  />
                        </>
                    ) : (
                        // Note - if passing participants here is an issue, we can just use JSON.parse(JSON.stringify())
                        <GenerateMatches participants={clientPlayers} categoryId={category._id} doubles={category.doubles} />
                    )}
                    <RemovePlayers players={players} categoryId={category._id} />
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
