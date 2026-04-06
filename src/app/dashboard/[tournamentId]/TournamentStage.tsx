"use client"

import { useState } from "react";
import CloseRegistration from "./CloseRegistration";
import { CategoryType, MatchType, TeamType, TournamentTypePopulated } from "@/lib/types";
import CloseDraw from "./CloseDraw";
import ReOpenRegistration from "./ReOpenRegistration";
import axios from "axios";

type TournamentStageProps = {
    tournament:TournamentTypePopulated
    categories:CategoryType[],
    matches:MatchType[],
    teams:TeamType[]
}

export default function TournamentStage({ tournament, categories, matches, teams }:TournamentStageProps) {
    return (
        <div className="standard-container-no-shadow">
            { tournament.stage === "sign-up" && (
                <StageSignUp tournamentId={tournament._id} />
            )}
            { tournament.stage === "draw" && (
                <StageDraw categories={categories} matches={matches} teams={teams} />
            )}
            { tournament.stage === "play" && (
                <StagePlay categories={categories} matches={matches} teams={teams} />
            )}
            { tournament.stage === "finished" && (
                <StageFinished />
            )}
        </div>
    )
}

type StageProps = {
    categories:CategoryType[],
    matches:MatchType[],
    teams:TeamType[]
}

function StageSignUp({ tournamentId }: { tournamentId:string }) {
    const [isCloseRegOpen, setIsCloseRegOpen] = useState(false);
    return (
        <div className="flex flex-col">
            <h4>Stage: Sign-Up</h4>
            <h5 className="text-center">Closing registration</h5>
            <p>
                Currently, the tournament is in it's 'sign-up' stage, meaning users with the right code can join. Once you wish to close registration, click the
                button below. Then you can use our tool to create the teams and matches.
            </p>
            <button
                className="submit text-center mt-2.5"
                onClick={() => setIsCloseRegOpen(!isCloseRegOpen)}
            >
                Close registration
            </button>
            { isCloseRegOpen && (
                <CloseRegistration tournamentId={tournamentId} setIsCloseRegOpen={setIsCloseRegOpen}/>
            )}
        </div>        
    )
}

function StageDraw({ categories, matches, teams }:StageProps) {
    // If matches have already been created for a match, category.locked will be TRUE, so filter these out
    const openCategories = categories.filter(category => !category.locked);
    const canReOpen = matches.length < 1 && teams.length < 1;

    const [isReOpenOpen, setIsReOpenOpen] = useState(false);
    const [isPlayOpen, setIsPlayOpen] = useState(false);
    return (
        <div className="flex flex-col">
            <h4>Stage: Draw</h4>
            { openCategories.length > 0 ? (
                <>
                    <h5 className="text-center italic">Creating Teams and/or Matches</h5>
                    <p>
                        The tournament is currently in the 'draw' stage. Users can no longer sign up to this tournament.
                        To create the necessary matches/teams, click on a category below and follow the directions on the page.
                        If you're seeing this message, it means that some categories do not yet have matches.
                    </p>
                    <p>
                        Once you create and save matches and teams, you can no longer re-open step back to the sign-up stage (unless you first delete all matches and teams).
                    </p>
                    { canReOpen && (
                        <>
                            <button
                                className="submit text-center mt-2.5"
                                onClick={() => setIsReOpenOpen(true)}
                            >
                                Re-Open Registration<i>*</i>
                            </button>
                            <p className="text-sm mt-2.5 italic">
                                * You can re-open registration as no teams or matches have been created. As soon as you create teams or matches for any category, you 
                                will no longer be able to re-open registration and no other players can join.
                            </p>
                            { isReOpenOpen && (
                                <ReOpenRegistration setIsOpen={setIsReOpenOpen} />
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    <h5 className="text-center italic">Time to play!</h5>
                    <p> You've created matches for all the categories in your tournament. Time to end the draw stage and move onto the play stage. Do this by clicking the button below:</p>
                    <button
                        className="submit text-slate-950 bg-lime-500 hover:bg-lime-400 focus:bg-lime-400 text-center"
                        onClick={() => setIsPlayOpen(true)}
                    >
                        Move to Play Stage
                    </button>
                    { isPlayOpen && (
                        <CloseDraw tournamentId={categories[0].tournament} setIsPlayOpen={setIsPlayOpen} />
                    )}
                </>
            )}
        </div>
    )
}

function StagePlay({ categories, matches, teams }:StageProps) {
    const [isClosedOpen, setIsClosedOpen] = useState<boolean>(false);
    const [loading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const activeMatches = matches.filter(v => v.state === "SCHEDULED");

    const handleCloseRegistration = (() => {
        setIsLoading(true);
        axios.put(`/api/tournament/${matches[0].tournament}`)
            .then(() => {
                setSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }).catch((err) => {
                console.error('Error updating tournament stage:', err);
                setError(err);
            }).finally(() => {
                setIsLoading(false);
            });
    });

    return (
        <div className="flex flex-col">
            <h4>Stage: Play</h4>
            <p>
                The part everyone has been waiting for! Now, everything is locked and you cannot make any more changes or 
                revert back to previous stages.
                All players will be able to see their teams, next matches, and results of the entire tournament. All that's left is to 
                play the matches!
            </p>
            <p>There are currently {activeMatches.length} matches to be played.</p>
            <button className="submit"
                onClick={() => setIsClosedOpen(!isClosedOpen)}
            >Finish Tournament</button>
            { isClosedOpen && (
                <div className="standard-container mt-2.5">
                    <h4>Finishing a tournmament</h4>
                    <p>You can close a tournament at any time during play stage, however doing so is an irreversible process.</p>
                    <p>Are you sure you want to finish this tournament?</p>
                    <div className="flex flex-col sm:grid grid-cols-2 gap-2.5 mt-2.5">
                        <button className="submit"
                            onClick={handleCloseRegistration}
                        >
                            Yes, finish tournament
                        </button>
                        <button className="submit"
                            onClick={() => setIsClosedOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function StageFinished() {
    return (
        <div className="flex flex-col">
            <h4>Stage: Finished</h4>
            <p>This tournament has ended. Thank you for using Tennis Tournament Creator!</p>
        </div>
    )
}
