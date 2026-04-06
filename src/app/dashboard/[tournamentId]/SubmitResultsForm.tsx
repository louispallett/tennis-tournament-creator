"use client"

import { MatchType } from "@/lib/types"
import axios from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ChevronDownIcon } from "@heroicons/react/16/solid";

type Props = { info: MatchType };

export default function SubmitResultsForm({ info }:Props) {
    const form = useForm();
    const { handleSubmit, formState } = form;
    const { errors } = formState;
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [checkedState, setCheckedState] = useState({ walkover: false });

    const player1Id = info.participants[0]._id;
    const player2Id = info.participants[1]._id;

    const [winner, setwinner] = useState("");

    // FIXME: Note, 'value' does not exist on event.target. See answer here:
    //    https://stackoverflow.com/questions/42081549/typescript-react-event-types
    // TLDR: we need to cast value as a HTMLInputElement.
    const handleWinnerChange = (event:Event) => setwinner(event.target.value);

    const [scores, setScores] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const player1Id = info.participants[0]._id;
        const player2Id = info.participants[1]._id;

        setScores({
            [player1Id]: [""],
            [player2Id]: [""],
        });
    }, [info]);
    
    const addSet = () => {
        if (scores[player1Id].length < 5) {
            setScores(prev => ({
                [player1Id]: [...prev[player1Id], ""],
                [player2Id]: [...prev[player2Id], ""],
            }));
        }
    };

    const removeSet = () => {
        if (scores[player1Id].length > 1) {
            setScores(prev => ({
                [player1Id]: prev[player1Id].slice(0, -1),
                [player2Id]: prev[player2Id].slice(0, -1),
            }));
        }
    };

    const handleCheckboxChange = (option:string) => {
        // FIXME: Error here is because `prevState` has not been given a type in (), so add this.
        setCheckedState((prevState) => ({
            ...prevState,
            [option]: !prevState[option],
        }));
    };

    const onSubmit = async (data:any) => {
        setError("");

        if (!winner) {
            setError("You must select a winner");
            return;
        }

        if ((!scores[player1Id][0] || !scores[player2Id][0]) && !checkedState.walkover) {
            setError("You must give a score or a walkover");
            return;
        }

        data.winner = winner;
        data.scores = checkedState.walkover ? {  } : scores; 
        setIsPending(true);
        axios.put(`/api/match/${info._id}`, {
            data
        }).then(() => {
            setSuccess(true);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }).catch((err:any) => {
            console.log(err);
            setError(err.response.statusText);
        }).finally(() => {
            setIsPending(false);
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col md:flex-row gap-2.5">
                <div className="w-full shadow-none! relative">
                    <select name="winner" id="winner" required value={winner} onChange={handleWinnerChange}
                        className="form-input shadow-none!"
                    >
                        <option value="">- &gt; Winner &lt; -</option>
                        <option value={info.participants[0]._id}>{info.participants[0].name}</option>
                        <option value={info.participants[1]._id}>{info.participants[1].name}</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <ChevronDownIcon className="h-6 w-6" />
                    </div>
                </div>
                <label className={`tournament-button shadow-none! ${checkedState.walkover ? "checked" : ""}`}>
                    <p>Walkover?</p>
                    <input
                        type="checkbox"
                        className="checkbox"
                        onChange={() => handleCheckboxChange("walkover")}
                    />
                    <span className="custom-checkbox"></span>
                </label>
            </div>
            { !checkedState.walkover && (
                <div className="mt-2.5 flex flex-col gap-2.5">
                    <h5 className="text-slate-50">Scores</h5>
                    <div className="flex items-center gap-2.5 standard-container-no-shadow bg-slate-50/90">
                        <p className="w-96">{info.participants[0].name}</p>
                        <div className="flex">
                            {scores[player1Id]?.map((value, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    className="border-2 p-1 w-9 rounded-sm text-center"
                                    value={value}
                                    onChange={(e) => {
                                        const newScores = [...scores[player1Id]];
                                        newScores[index] = e.target.value;
                                        setScores(prev => ({ ...prev, [player1Id]: newScores }));
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 standard-container-no-shadow bg-slate-50/90">
                        <p className="w-96">{info.participants[1].name}</p>
                        <div className="flex">
                            {scores[player2Id]?.map((value, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    className="border-2 p-1 w-9 rounded-sm text-center"
                                    value={value}
                                    onChange={(e) => {
                                        const newScores = [...scores[player2Id]];
                                        newScores[index] = e.target.value;
                                        setScores(prev => ({ ...prev, [player2Id]: newScores }));
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row self-end md:self-auto gap-2.5 mt-2.5">
                        <button type="button" onClick={addSet} className="success max-w-48 shadow-none!">+ Add Set</button>
                        <button type="button" onClick={removeSet} className="danger max-w-48 shadow-none!">- Remove Set</button>
                    </div>
                </div>
            )}
            <div className="mt-2.5">
                { isPending ? (
                    <div className="success flex justify-center items-center">
                        <div className="spinner h-6 w-6"></div>
                    </div>
                ) : (
                    <>
                        { success ? (
                            <div className="success">Success! Please wait...</div>
                        ) : (
                            <button className="success">Submit</button>
                        )}
                    </>
                )}
                { error && (
                    <p className="standard-container bg-red-500 mt-2.5">{error}</p>
                )}
            </div>
        </form>
    )
}
