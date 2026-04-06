"use client"

import { PlayerTypePopulated } from "@/lib/types"
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

type SeedingPlayersProps = { players:PlayerTypePopulated[] }

export default function SeedingPlayers({ players }:SeedingPlayersProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col gap-2.5 my-5">
            <h4 className="text-center">Seeding Players</h4>
            <p>Players can select whether they are seeded when they join the tournament. However, as the host, you can edit which players are seeded.</p>
            <h5>Why is seeding important?</h5>
            <p>
                Seeding is used when creating teams for doubles categories. When teams are created, seeded players and non-seeded players are divided into 
                separate groups. Both groups are then shuffled and each seeded player is matched with a non-seeded player until there are no seeded players 
                left. Then, the remaining non-seeded players are matched together.
            </p>
            <p>This ensures that two seeded players are not matched together.</p>
            <p>
                The function for creating teams also handles cases where the number of seeded players is greater than the number of non-seeded players. 
                Although... to be honest, if that's the case, you should be thinking about 'un-seeding' some players! If this is the case, it's inevitable that
                some seeded players will be matched together, which is why it isn't ideal.
            </p>
            <p>If you don't want seeding and want team creation to be completely random, just make sure no players are seeded.</p>
            <button
                className="submit text-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                Seed Players
            </button>
            { isOpen && (
                <SeedPlayersForm players={players} setIsOpen={setIsOpen} />
            )}
        </div>
    )
}

type SeedPlayersFormProps = { 
    players:PlayerTypePopulated[],
    setIsOpen:any
}

function SeedPlayersForm({ players, setIsOpen }:SeedPlayersFormProps) {
    const [error, setError] = useState(null);
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState(false);

    const malePlayers = players.filter(x => x.male);
    const femalePlayers = players.filter(x => !x.male);

    const onSubmit = async (data:any) => {
        setIsPending(true);
        axios.put("/api/player/update-seedings", data)
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
            });
    }

    return (
        <div className="standard-container p-2.5 flex flex-col justify-center items-center">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <h4>Players</h4>
                <div className="flex flex-col lg:grid grid-cols-2 gap-10">
                    <div className="flex flex-col gap-2.5">
                        <h4>Male Players</h4>
                        { malePlayers.length > 0 ? (
                            <>
                                { malePlayers.map(item => (
                                    <PlayerSeedCard data={item} key={item._id} register={register} reg={item._id} />
                                ))}
                            </>
                        ) : (
                            <p><i>No male players</i></p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2.5 text-right">
                        <h4>Female Players</h4>
                        { femalePlayers.length > 0 ? (
                            <>
                                { femalePlayers.map(item => (
                                    <PlayerSeedCard data={item} key={item._id} register={register} reg={item._id} />
                                ))}                        
                            </>
                        ) : (
                            <p><i>No female players</i></p>
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
                <button className="submit justify-center" type="button"
                    onClick={() => setIsOpen(false)}
                >
                    Close
                </button>
            </form>
        </div>
    )
}

type PlayerSeedCardProps = {
    data:PlayerTypePopulated,
    register:any,
    reg:string
}


function PlayerSeedCard({ data, register, reg }:PlayerSeedCardProps) {
    return (
        <div className="standard-container p-2! flex flex-1 justify-between shadow-none! items-center gap-2.5">
            <p className="text-left">{data.user.firstName} {data.user.lastName}</p>
            <input type="checkbox"
                id={reg}
                defaultChecked={data.seeded}
                {...register(reg, {})}
            />
        </div>
    )
}
