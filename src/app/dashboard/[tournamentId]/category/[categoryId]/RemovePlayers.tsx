"use client"

import { PlayerTypePopulated } from "@/lib/types"
import axios, { AxiosError } from "axios"
import { useState } from "react"

type EditPlayersProps = {
    players:PlayerTypePopulated[],
    categoryId:string
}

export default function RemovePlayers({ players, categoryId }:EditPlayersProps) {
    const [open, isOpen] = useState(false);
    return (
        <div>
            <button className="submit" onClick={() => isOpen(!open)}>Remove Players</button>
            { open && (
                <RemovePlayersInner players={players} categoryId={categoryId} />
            )}
        </div>
    )
}

function RemovePlayersInner({ players, categoryId }:EditPlayersProps) {
    const [deletedPlayers, setDeletedPlayers] = useState<PlayerTypePopulated[]>([]);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [serverError, setServerError] = useState<AxiosError | null>(null);

    const onSubmit = () => {
        setIsPending(true);
        axios.put(`/api/player/removeFromCategory/${categoryId}`, {
            deletedPlayers
        }).then(() => {
            window.location.reload();
        }).catch((err:any) => {
            console.log(err);
            setServerError(err.message);
        });
        setIsPending(false);
    }
    
    return (
        <div className="standard-container bg-indigo-500 mt-2.5">
            <div className="tournament-grid-sm py-2.5">
                { players.map((player) => (
                    <PlayerCard player={player} key={player._id} deletedPlayers={deletedPlayers} setDeletedPlayers={setDeletedPlayers} />
                ))}
            </div>
            <button className="success"
                onClick={onSubmit}
            >Save</button>
        </div>
    )
}

type PlayerCardProps = { 
    player:PlayerTypePopulated,
    deletedPlayers:PlayerTypePopulated[],
    setDeletedPlayers: (v: PlayerTypePopulated[]) => void
}

function PlayerCard({ player, deletedPlayers, setDeletedPlayers }:PlayerCardProps) {
    const isDeleted = deletedPlayers.includes(player);

    const handleXChange = () => {
        if (isDeleted) {
            setDeletedPlayers(deletedPlayers.filter((_player:PlayerTypePopulated) => _player !== player));
        } else {
            setDeletedPlayers([...deletedPlayers, player]);
        }
    }

    return (
        <div 
            className={"standard-container flex justify-between gap-1.5 " + (isDeleted ? "bg-slate-300 opacity-50" : "bg-slate-100")}
        >
            <p>{player.user.firstName} {player.user.lastName}</p>
            <button className="px-2.5 border-slate-900 border-2 bg-red-500"
                onClick={handleXChange}
            >
                X
            </button>
        </div>
    )
}
