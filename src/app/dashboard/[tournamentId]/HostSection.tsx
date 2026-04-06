import { CategoryType, MatchType, PlayerType, TeamType, TournamentTypePopulated } from "@/lib/types";
import Link from "next/link";
import TournamentStage from "./TournamentStage";
import RankPlayers from "./RankPlayers";
import SeedingPlayers from "./SeedingPlayers";

type HostSectionProps = {
    tournament:TournamentTypePopulated,
    categories:CategoryType[],
    matches:MatchType[]
    players:PlayerType[],
    teams:TeamType[]
}

export default function HostSection({ tournament, categories, matches, players, teams }: HostSectionProps) {
    const tournamentClient = JSON.parse(JSON.stringify(tournament));
    const categoriesClient = JSON.parse(JSON.stringify(categories));
    const matchesClient = JSON.parse(JSON.stringify(matches));
    const teamsClient = JSON.parse(JSON.stringify(teams));
    const playersClient = JSON.parse(JSON.stringify(players));

    return (
        <div className="standard-container container-indigo flex flex-col gap-2.5">
            <h3>Host Section</h3>
            <p>Hi {tournament.host.firstName}! Welcome to your host section. Here you can make unique operations and changes to the tournament reserved only for you (as host).</p>
            <TournamentStage tournament={tournamentClient} categories={categoriesClient} matches={matchesClient} teams={teamsClient} />
            { categories.length > 0 && (
                <>
                    <h4 className="text-center mt-4">Categories</h4>
                    <p>
                        Below you'll see each category for your tournament. You can click on each individual category to find out information about the category and create the matches
                        for each category in your tournament.
                    </p>
                    <div className="tournament-grid-sm">
                        { categories.map(item => (
                            <CategoryFunctions tournamentId={tournament._id} data={item} key={item._id} />
                        ))}
                    </div>
                </>
            )}
                { tournament.stage === "draw" && (
                    <>
                        <RankPlayers players={playersClient} />
                        <SeedingPlayers players={playersClient} />
                    </>
                )}
        </div>
    )
}

type CategoryFunctionsProps = { 
    tournamentId:string
    data:CategoryType 
}

function CategoryFunctions({ tournamentId, data }:CategoryFunctionsProps) {
    return (
            <Link href={`/dashboard/${tournamentId}/category/${data._id}`}>
                <button
                    className="submit"
                >
                    {data.name}
                </button>
            </Link>
    )
}
