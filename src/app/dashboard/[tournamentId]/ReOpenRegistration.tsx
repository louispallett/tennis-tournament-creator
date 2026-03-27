"use client"

import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import { useParams } from "next/navigation"
import React, { useState } from "react";

type ReOpenRegistrationProps = {
    setIsOpen:React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ReOpenRegistration({ setIsOpen }:ReOpenRegistrationProps) {
    const params = useParams();
    const [submitted, setSubmitted] = useState(false);
    const [invalidatedData, setInValidatedData] = useState([]);
    const [loading, setLoading] = useState(false);  

    const validateTournament = () => {
        setLoading(true);
        axios.get(`/api/tournament/${params.tournamentId}/validateReOpen/`)
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
                <h3>Re-Opening Registration</h3>
                <p>You can re-open registration as long as you haven't created any matches or tournaments yet.</p>
                <p>
                    This will set the stage of the tournament back to 'sign-up' and users will then be able to sign-up normally using the tournament code. 
                    When ready, you can then close the tournament again. However, please note that your tournament will need to pass the same validation checks as before.
                </p>
                <p>In order to close registration, you have to pass the following validation checks:</p>
                <div>
                    <ValidationRequirement rule={"No teams have been created."} id={0} data={invalidatedData} submitted={submitted} loading={loading} />
                    <ValidationRequirement rule={"No matches have been created."} id={1} data={invalidatedData} submitted={submitted} loading={loading} />
                    <ValidationRequirement rule={"No category has been locked."} id={2} data={invalidatedData} submitted={submitted} loading={loading} />
                </div>
                    { invalidatedData.length > 0 && (
                        <div>
                            <p className="text-red-600">Failed? That means you've already created and saved teams or matches.</p>
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
                                                <ReOpenRegistrationButton />
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
                                onClick={() => setIsOpen(false)}
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

function ReOpenRegistrationButton() {
    return (
        <></>
    )
}
