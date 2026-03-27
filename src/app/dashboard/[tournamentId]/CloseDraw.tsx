"use client"

import axios from "axios";
import { useState } from "react";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/16/solid";

type CloseDrawProps = {
    tournamentId:string,
    setIsPlayOpen:any
}

export default function CloseDraw({ tournamentId, setIsPlayOpen }:CloseDrawProps) {
    const [submitted, setSubmitted] = useState(false);
    const [invalidatedData, setInValidatedData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const validateTournament = () => {
        setLoading(true);
        axios.get(`/api/tournament/${tournamentId}/validateDraw`)
            .then((response) => {
                setInValidatedData(response.data);
                setSubmitted(true);
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                setLoading(false);
            })
    }

    return (
        <div className="standard-container-no-shadow mt-2.5">
            <div className="flex flex-col gap-2.5">
                <h3>Closing Draw</h3>
                <p>In order to close the draw stage and move to the play stage, your tournament has to pass a few validation checks:</p>                
                <div>
                    <ValidationRequirement rule={"All categories must have matches."} id={0} data={invalidatedData} submitted={submitted} loading={loading} />
                    {/* <ValidationRequirement rule={"The number of matches in each category must equal: no. of players - 1."} id={1} data={invalidatedData} submitted={submitted} loading={loading} /> */}
                </div>
                    { invalidatedData.length > 0 && (
                        <div>
                            <p className="text-red-600">Failed? That means one or more categories needs to have matches created for them!</p>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-2.5">
                        <div className="w-full">
                            { loading ? (
                                <button className="submit cursor-wait flex justify-center">
                                    <div className="spinner h-6 w-6"></div>
                                </button>
                            ) : (
                                <>
                                    { submitted ? (
                                        <>
                                            { invalidatedData.length < 1 ? (
                                                <CloseDrawButton tournamentId={tournamentId} />
                                            ) : (
                                                <button className="submit"
                                                    onClick={validateTournament} 
                                                >
                                                    <b>Validate</b>
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <button className="submit"
                                            onClick={validateTournament} 
                                        >
                                            <b>Validate</b>
                                        </button>
                                    )}
                                </>
                            )}

                        </div>
                            <button className="submit"
                                onClick={() => setIsPlayOpen(false)}
                            >
                                Close
                        </button>
                    </div>
            </div>
        </div>
    )
}

type ValidationRequirementProps = {
    rule:string,
    id:number,
    data:number[],
    submitted:boolean,
    loading:boolean
}

function ValidationRequirement({ rule, id, data, submitted, loading }:ValidationRequirementProps) {
    const invalid = data.includes(id);

    return (
        <div className="flex gap-2.5 ml-5">
            <p>&gt; {rule}</p>
            <div>
                { loading && (
                    <div className="spinner w-4 h-4"></div>
                )}
                { submitted && (
                    <>
                        { invalid ? (
                            <XCircleIcon className="w-6 text-red-600" />
                        ) : (
                            <CheckBadgeIcon className="w-6 text-lime-600" />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function CloseDrawButton({ tournamentId }: { tournamentId:string }) {
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCloseRegistration = (() => {
        setLoading(true);
        axios.put(`/api/tournament/${tournamentId}`)
            .then(() => {
                setSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }).catch((err) => {
                console.error('Error updating tournament stage:', err);
                setError(err);
            }).finally(() => {
                setLoading(false);
            })
    });

    return (
        <>
            { loading ? (
                <button className="submit cursor-wait flex justify-center">
                    <div className="spinner h-6 w-6"></div>
                </button>
            ) : (
                <>
                    { error ? (
                        <p>Error</p>
                    ) : (
                        <>
                            { success ? (
                                <button className="success flex justify-center items-center gap-2.5"
                                >
                                    <b>Success! Please wait...</b>
                                    <div className="spinner w-4 h-4"></div>
                                </button>
                            ) : (
                                <button className="submit"
                                    onClick={handleCloseRegistration}
                                >
                                    <b>Close Draw</b>
                                </button>
                            )}
                        </>
                    )}
                </>
            ) }
        </>
    )
}
