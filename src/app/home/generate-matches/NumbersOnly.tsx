"use client"

import Bracket from "@/app/dashboard/[tournamentId]/Bracket";
import { MatchTypeLite } from "@/lib/types";
import axios from "axios";
import { useState } from "react"
import { useForm } from "react-hook-form";
import QualifyingMatches from "./QualifyingMatches";

export default function NumbersOnly() {
    const [matches, setMatches] = useState<MatchTypeLite[] | null>(null);
    const [qualMatches, setQualMatches] = useState<MatchTypeLite[] | null>(null);
    const [error, setError] = useState(null);
    const form = useForm();
    const { register, handleSubmit, formState, watch, reset, setValue, trigger } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState(false);

    const onSubmit = (data:any) => {
        setIsPending(true);
        setMatches(null);
        setQualMatches(null);
        const players = ((n:number) => {
            const result = [];
            for (let i = 1; i <= n; i++) {
                result.push({
                    name: "Player " + i.toString(),
                    rank: i
                });
            }
            return result;
        })(data.numOfPlayers);

        axios.post("/api/match/client-generate", { players })
            .then((response:any) => {
                const returnedMatches = response.data.matches;
                const matchesClient = returnedMatches.map((match: any, matchIdx: number) => ({
                    _id: match._id,
                    id: match._id,
                    category: { name: "" },
                    nextMatchId: match.nextMatchId,
                    qualifyingMatch: match.qualifyingMatch,
                    tournamentRoundText: match.tournamentRoundText,
                    state: "SCHEDULED",
                        participants: match.participants.map((participant:any, idx:number) => ({
                            name: typeof participant === "string" ? participant : participant.name,
                            resultText: "",
                        })),
                    previousMatchId: match.previousMatchId || []
                }));

                const matchesClientFiltered = matchesClient.filter((match:MatchTypeLite) => !match.qualifyingMatch);
                setMatches(matchesClientFiltered);
                const matchesClientQual = matchesClient.filter((match:MatchTypeLite) => match.qualifyingMatch);
                setQualMatches(matchesClientQual);
            }).catch((err:any) => {
                console.error(err);
                setError(err.response.data.message);
            }).finally(() => {
                setIsPending(false);
            })
    }


    return (
        <div className="standard-container bg-slate-200/75 my-2.5">
            <h3 className="home-subtitle text-4xl! mb-5">Try It Out</h3>
            <div className="flex flex-col gap-2.5">
                <p>You can quickly try it out using just the number of players.</p>
                <p>
                    Use the form below to enter the number of players in the tournament. This will
                    create a tournament bracket with that number of players, each named according to
                    their ranking (i.e. "Player 1", "Player 2").
                </p>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col sm:flex-row gap-2.5">
                    <input type="number" className="form-input" 
                        {...register("numOfPlayers", {
                            required: "Required",
                            min: {
                                value: 2,
                                message: "Must be a positive integer greater than 1"
                            },
                            max: {
                                value: 1024,
                                message: "Cannot be greater than 1024"
                            }
                        })}
                    />
                    <button className="submit">Create</button>
                </form>
                <span>
                    <p className="text-red-600 font-bold mt-1.5 text-xs">{String(errors.numOfPlayers?.message)}</p>
                </span>
            </div>
            { isPending && (
                <div className="flex justify-center m-5">
                    <div className="spinner h-16 w-16"></div>
                </div>
            )}
            { matches && (
                <Bracket matchData={matches} categoryName="" />
            )}
            { qualMatches && (
                <>
                    { qualMatches.length > 0 && (
                        <QualifyingMatches matches={qualMatches} allMatches={matches} />
                    )}
                </>
            )}

        </div>
    )
}
