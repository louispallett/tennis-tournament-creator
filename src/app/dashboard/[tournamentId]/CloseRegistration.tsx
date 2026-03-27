"use client"

import axios from "axios";
import { useState } from "react";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/16/solid";

type CloseRegistrationProps = {
    tournamentId:string,
    setIsCloseRegOpen:any
}

export default function CloseRegistration({ tournamentId, setIsCloseRegOpen }:CloseRegistrationProps) {
    const [submitted, setSubmitted] = useState(false);
    const [invalidatedData, setInValidatedData] = useState([]);
    const [loading, setLoading] = useState(false);

    const validateTournament = () => {
        setLoading(true);
        axios.get(`/api/tournament/${tournamentId}/validateTournament/`)
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
                <h3>Closing Registration</h3>
                <p>In order to close registration, your tournament has to pass a few validation checks:</p>                
                <div>
                    <ValidationRequirement rule={"All doubles categories must have at least 8 players."} id={0} data={invalidatedData} submitted={submitted} loading={loading} />
                    <ValidationRequirement rule={"All doubles categories must have an even number of players."} id={1} data={invalidatedData} submitted={submitted} loading={loading} />
                    <ValidationRequirement rule={"All singles categories must have at least 4 players."} id={2} data={invalidatedData} submitted={submitted} loading={loading} />
                    <ValidationRequirement rule={"Mixed Doubles must have an equal number of male and female players"} id={3} data={invalidatedData} submitted={submitted} loading={loading} />
                </div>
                    <p>Please note that if your tournament does not have a certain category, the rule for that category will still show above, but it should still pass the validation.</p>
                    { invalidatedData.length > 0 && (
                        <div>
                            <p className="text-red-600">Failed one or more validation checks? You can manage the players for each individual category to remove any if necessary.</p>
                            <p className="text-red-600">If you are no longer able to get the minimum number of players, you can cancel and delete a category on the category page.</p>
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
                                                <CloseRegistrationButton tournamentId={tournamentId} />
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
                                onClick={() => setIsCloseRegOpen(false)}
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

function CloseRegistrationButton({ tournamentId }: { tournamentId:string }) {
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
                                    <b>Close Tournament</b>
                                </button>
                            )}
                        </>
                    )}
                </>
            ) }
        </>
    )
}
