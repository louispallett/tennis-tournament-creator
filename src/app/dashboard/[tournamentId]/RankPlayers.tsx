"use client"

import { PlayerTypePopulated } from "@/lib/types";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

type RankPlayersProps = { players:PlayerTypePopulated[] }

export default function RankPlayers({ players }:RankPlayersProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState(false);

    const maleSeeded = players.filter(x => x.male && x.seeded);
    const femaleSeeded = players.filter(x => !x.male && x.seeded);
    const maleNonSeeded = players.filter(x => x.male && !x.seeded);
    const femaleNonSeeded = players.filter(x => !x.male && !x.seeded);

    const onSubmit = async (data:any) => {
        setIsPending(true);
        axios.put("/api/player/update-rankings", data)
        .then(() => {
            setError(null);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 1500)
        }).catch(err => {
            console.log(err);
            setError(err.response.data.message);
        }).finally(() => {
            setIsPending(false);
        })
    }

    return (
        <div className="flex flex-col gap-2.5 my-5">
            <h4 className="text-center">Ranking Players</h4>
            <p>You can set each players rankings by clicking on the button below. You'll want to rank males and females seperately (i.e. there can be a 'rank 1' male and a 'rank 1' female, but not two rank 1 males).</p>
            <p>
                Ranking allows the programme to generate 'strategic tournament bracket'. This means that the top two players will be assigned to matches so that they can both reach the final <i>without playing each other before</i>. Similarly, 
                the top four players won't meet each other until the semi-finals, the top eight until the quarter-finals, and so on.
            </p>
            <p>
                If you're only organising a small tournament of, for example, 4-6 players (or teams for doubles) in each category, this may not be necessary. However, it is recommended for larger tournaments, otherwise you may face a situation where
                the top ranking player plays the next three ranked players before reaching the final, and then plays the fifth ranked player... which may not result in a particularly satisfying final (since the rank 1 player is likely to win)!
            </p>
            <button
                className="submit text-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                Rank Players
            </button>
            { isOpen && (
                <div className="standard-container p-2.5 flex flex-col justify-center items-center">
                    { players && (
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <h4>Players</h4>
                            <div className="flex flex-col lg:grid grid-cols-2 gap-10">
                                <div className="flex flex-col gap-2.5">
                                    <h4>Male Players</h4>
                                    { maleSeeded.length > 0 && (
                                        <>
                                            <p><i>Seeded</i></p>
                                            { maleSeeded.map(item => (
                                                <PlayerRankCard data={item} key={item._id} register={register} reg={item._id}/>
                                            ))}
                                            <hr />
                                        </>
                                    )}
                                    { maleNonSeeded.length > 0 && (
                                        <>
                                            <p><i>Non-Seeded</i></p>
                                            { maleNonSeeded.map(item => (
                                                <PlayerRankCard data={item} key={item._id} register={register} reg={item._id} />
                                            ))}
                                        </>
                                    )}  
                                </div>
                                <div className="flex flex-col gap-2.5 text-right">
                                    <h4>Female Players</h4>
                                    { femaleSeeded.length > 0 && (
                                        <>
                                            <p><i>Seeded</i></p>
                                            { femaleSeeded.map(item => (
                                                <PlayerRankCard data={item} key={item._id} register={register} reg={item._id} />
                                            ))}
                                            <hr />                                      
                                        </>
                                    )}
                                    { femaleNonSeeded.length > 0 && (
                                        <>
                                            <p><i>Non-Seeded</i></p>
                                            { femaleNonSeeded.map(item => (
                                                <PlayerRankCard data={item} key={item._id} register={register} reg={item._id} />
                                            ))}                                        
                                        </>
                                    )}
                                </div>
                            </div>
                            { success ? (
                                <div 
                                    className="success flex justify-center my-2.5"
                                >
                                    Success!
                                </div>
                            ) : (
                                <button
                                    className="submit flex justify-center my-2.5"
                                    type="submit"
                                >
                                    {isPending ? (
                                        <div className="spinner h-6 w-6"></div>
                                    ) : (
                                        <>
                                            Submit
                                        </>
                                    )}
                                </button>
                            )}
                            <button className="submit justify-center"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                Close
                            </button>
                        </form>
                    )}
                    { error && (
                        <>
                            {/* <img src={errorSVG} alt="" className="h-24"/> */}
                            <div className="text-center">
                                <p>{error}</p>
                                <p>Sorry about that! Some sort of error has occured. If the issue keeps persisting, please contact the administrator.</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

type PlayerRankCardProps = {
    data:PlayerTypePopulated,
    register:any,
    reg:string
}

function PlayerRankCard({ data, register, reg }:PlayerRankCardProps) {
    return (
        <div className="standard-container p-2! flex flex-1 justify-between shadow-none! items-center gap-2.5">
            <p className="text-left">{data.user.firstName} {data.user.lastName}</p>
            <input type="number" className="form-input p-2! max-w-24 shadow-none!"
                required
                id={reg}
                defaultValue={data.ranking}
                {...register(reg, {
                    required: "Is required",
                    min: {
                        value: 0,
                        message: "Must be a positive integer"
                    }
                })}
            />
        </div>
    )
}
