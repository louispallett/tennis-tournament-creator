"use client"

import { MatchType, PlayerType, UserType } from "@/lib/types"
import axios from "axios"
import { useEffect, useState } from "react"
import { useRef } from "react";
import NoInfo from "./NoInfo"
import SubmitResultsForm from "./SubmitResultsForm";

type UserMatchesProps = { 
    userMatches:MatchType[],
    stage:string
}

export default function UserMatches({ userMatches, stage }:UserMatchesProps) {
    const [isOpen, setIsOpen] = useState<MatchType | null>(null);
    const matchInfoRef = useRef<HTMLDivElement | null>(null); 
    
    useEffect(() => {
        if (isOpen && matchInfoRef.current) {
            matchInfoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [isOpen]);

    return (
        <div className="standard-container container-indigo flex flex-col gap-2.5 z-0">
            <h3>Your Upcoming Matches</h3>
            { (stage === "play" || stage === "finished") ? (
                <>
                    {userMatches?.length > 0 ? (
                        <>
                            <p>These are your next upcoming matches. Click on each one to find out more information and submit scores.</p>
                            <div className="tournament-grid-sm">
                                {userMatches.map(item => (
                                    <MatchCard setIsOpen={setIsOpen} data={item} key={item._id} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <NoInfo text="No upcoming matches" />
                    )}
                </>                
            ) : (
                <NoInfo text="Matches will appear here when your host completes the draw" />
            )}

            {isOpen && (
                <div ref={matchInfoRef}>
                    <MatchInfo data={isOpen} setIsOpen={setIsOpen} />
                </div>
            )}
        </div>
    );
}


type MatchCardProps = {
    setIsOpen: (v: MatchType | null) => void,
    data:MatchType
}

function MatchCard({ setIsOpen, data }:MatchCardProps) {
    return (
        <div className="standard-container-no-shadow bg-indigo-600/90 max-w-4xl hover:bg-indigo-500 cursor-pointer"
            onClick={() => setIsOpen(data)}
        >
            <h5 className="standard-container-no-shadow mb-2.5 text-center bg-lime-400 shadow-none">{data.category.name}</h5>
            <div className="flex justify-between flex-col lg:flex-row items-center gap-2.5">
                <p className="standard-container-no-shadow bg-slate-100 shadow-none">{data.participants.length > 0 ? data.participants[0].name : "TBC"}</p>
                <p className="text-white">vs</p>
                <p className="standard-container-no-shadow bg-slate-100 shadow-none">{data.participants.length > 1 ? data.participants[1].name : "TBC"}</p>
            </div>
            <div className="flex gap-2.5">
                <p className="standard-container-no-shadow bg-slate-100 shadow-none mt-2.5">Deadline: {data.deadline}</p>
                <p className="standard-container-no-shadow bg-slate-100 shadow-none mt-2.5">Round: {data.tournamentRoundText}</p>
            </div>
        </div>
    )
}

function MatchInfo({ data, setIsOpen }:MatchCardProps) {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState(null);
    const singles = data.category.name === "Men's Singles" || data.category.name === "Women's Singles";
    
useEffect(() => {
    const getUserInfo = async () => {
        const players = [];

        for (const participant of data.participants) {
            try {
                if (singles) {
                    const response = await axios.get(`/api/auth/player/${participant.participantId}`);
                    players.push(response.data);
                } else {
                    const response = await axios.get(`/api/auth/team/${participant.participantId}`);
                    players.push(...response.data);
                }
            } catch (err) {
                console.log(err);
            }
            setLoading(false);
        }
        setUsers(players);
    };

    getUserInfo();
}, [data]);

    return (
        <div className="standard-container-no-shadow">
            <h4 className="standard-container-no-shadow mb-2.5 text-center bg-lime-400">{data.category.name}</h4>
            <div className="flex flex-col lg:grid grid-cols-2 gap-2.5">
                <div className="standard-container-no-shadow flex flex-col sm:grid grid-cols-2 gap-2.5 self-start items-start bg-indigo-600/90">
                    { data.qualifyingMatch && (
                        <p className="standard-container-no-shadow bg-slate-50/90">Qualifying Match</p>
                    )}
                    <p className="standard-container-no-shadow bg-slate-50/90">Round: {data.tournamentRoundText}</p>
                    <p className="standard-container-no-shadow bg-slate-50/90">Deadline: {data.deadline}</p>
                </div>
                <div className="standard-container-no-shadow bg-indigo-600/90">
                    <h5 className="text-white">Contact Details</h5>
                    { users && (
                        <div>
                            { users.map((player: PlayerType) => (
                                <ContactDetails user={player} key={player._id}/>
                            ))}
                        </div>
                    )}
                    { loading && (
                        <div className="flex justify-center items-center">
                            <div className="spinner h-6 w-6"></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="standard-container-no-shadow mt-2.5 flex flex-col gap-2.5 bg-indigo-600/90">
                <h4 className="text-slate-50">Submit Results</h4>
                { data.participants.length > 1 ? (
                    <SubmitResultsForm info={data} />
                ) : (
                    <p className="text-slate-50">Please wait for all players to join this match before submitting results.</p>
                )}
            </div>
            <button className="submit mt-2.5"
                onClick={() => setIsOpen(false)}
            >Close</button>
        </div>
    )
}

type ContactDetailsProps = { user:UserType };

function ContactDetails({ user }:ContactDetailsProps) {
    return (
        <div className="grid grid-cols-2 gap-2.5 standard-container-no-shadow bg-slate-50/90 my-1">
            <p>{user["name-long"]}</p>
            <p>{user.mobCode} {user.mobile}</p>
        </div>
    )
}
