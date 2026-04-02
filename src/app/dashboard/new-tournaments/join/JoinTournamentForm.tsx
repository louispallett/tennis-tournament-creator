"use client"

import { CategoryType } from "@/lib/types";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";


export default function JoinTournamentForm({ validTournament }: { validTournament:any }) {
    const form = useForm();
    const { register, control, handleSubmit, formState, watch, reset, setValue, trigger } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [signupError, setSignupError] = useState(null);
    const [checkedState, setCheckedState] = useState({
        "Men's Singles": false,
        "Men's Doubles": false,
        "Women's Singles": false, 
        "Women's Doubles": false,
        "Mixed Doubles": false,
    });

    const handleCheckboxChange = (option:string) => {
        setCheckedState((prevState) => ({
            ...prevState,
            [option]: !prevState[option],
        }));
    };

    const onSubmit = async (data:any) => {
        setSignupError(null);
        setIsPending(true);
        
        data.tournamentId = validTournament._id;
        data.gender = gender;
        
        for (let option in checkedState) {
            if (checkedState[option]) {
                data.categories.push(option);
            }
        }
        
        if (data.categories.length < 1) {
            setSignupError({ message: "At least one category must be selected"});
            return;
        }
        
        axios.post("/api/player", data)
            .then(() => {
                setSuccess(true);
                setTimeout(() => {
                    window.location.assign("/dashboard");
                }, 1000);
            }).catch((err:any) => {
                console.log(err);
                setSignupError(err.response.data)
            }).finally(() => {
                setIsPending(false);
            })
    }

    const [tournamentCategories, setTournamentCategories] = useState<string[] | null>(null);

    useEffect(() => {
        const getCategories = () => {
            axios.get(`/api/category/get-tournament-categories/${validTournament._id}`)
                .then((response) => {
                    console.log(response.data)
                    setTournamentCategories(response.data);
                }).catch((err) => {
                    console.log(err);
                });
        }
        getCategories();
    }, []);

    const [gender, setGender] = useState("");
    const [tournamentsVisible, setTournamentsVisible] = useState(false);

    const handleGenderChange = (event:Event) => {
        setCheckedState((prevState) => {
            const resetState = Object.keys(prevState).reduce((acc, key) => {
                acc[key] = false;
                return acc;
            }, {});
            return resetState;
        });
        const selectedGender = event.target.value;
        setGender(selectedGender);
        setTournamentsVisible(selectedGender === 'male' || selectedGender === 'female');
        reset({ categories: [] });
        setValue("gender", selectedGender);
        trigger("gender");
    }
    

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="form">
            <div className="relative w-full h-full flex flex-col gap-2.5">
                <div>
                    <h3>Tournament Details</h3>
                    <div className="flex flex-col lg:flex-row gap-2.5">
                        <input type="text" className="hidden form-input bg-indigo-500 text-white" defaultValue={validTournament._id} disabled
                            {...register ("tournamentId", {})}
                        />
                        <div className="form-input bg-indigo-500 text-white">
                            <p>{validTournament.name}</p>
                        </div>
                        <div className="form-input bg-indigo-500 text-white text-right">
                            <p>Hosted by: {validTournament.host["name-long"]}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3>Your Tournament Preferences</h3>
                    <div>
                        <div className="relative">
                            <select name="gender" id="gender" required value={gender} onChange={handleGenderChange}
                                className="form-input">
                                <option value="">- &gt; Gender &lt; -</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                                <ChevronDownIcon className="h-6 w-6" />
                            </div>
                        </div>
                        {/* <span className="text-xs font-bold text-red-700 dark:text-red-400">
                            <p>{errors.gender?.message}</p>
                        </span> */}
                    </div>
                </div>
                { tournamentCategories && (
                    <div id="tournaments-wrapper" className={tournamentsVisible ? '' : 'hidden'}>
                        <h3 className="font-roboto text-center mt-2.5">Categories</h3>
                        <h4>Select at least one category you wish to play</h4>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-col sm:flex-row gap-2.5">
                                { gender == "male" ? (
                                    <>
                                        { (!tournamentCategories.includes("Men's Singles") && !tournamentCategories.includes("Men's Doubles") && !tournamentCategories.includes("Mixed Doubles")) && (
                                            <p>No categories for this gender</p>
                                        )}
                                        { tournamentCategories.includes("Men's Singles") && (
                                            <label className={`tournament-button ${checkedState["Men's Singles"] ? "checked" : ""}`}>
                                                <p>Men's Singles</p>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    onChange={() => handleCheckboxChange("Men's Singles")}
                                                />
                                                <span className="custom-checkbox"></span>
                                            </label>
                                        )}
                                        { tournamentCategories.includes("Men's Doubles") && (
                                            <label className={`tournament-button ${checkedState["Men's Doubles"] ? "checked" : ""}`}>
                                                <p>Men's Doubles</p>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    onChange={() => handleCheckboxChange("Men's Doubles")}
                                                />
                                                <span className="custom-checkbox"></span>
                                            </label>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        { (!tournamentCategories.includes("Women's Singles") && !tournamentCategories.includes("Women's Doubles") && !tournamentCategories.includes("Mixed Doubles")) && (
                                            <p>No categories for this gender</p>
                                        )}
                                        { tournamentCategories.includes("Women's Singles") && (
                                            <label className={`tournament-button ${checkedState["Women's Singles"] ? "checked" : ""}`}>
                                                <p>Women's Singles</p>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    onChange={() => handleCheckboxChange("Women's Singles")}
                                                />
                                                <span className="custom-checkbox"></span>
                                            </label>
                                        )}
                                        { tournamentCategories.includes("Women's Doubles") && (
                                            <label className={`tournament-button ${checkedState["Women's Doubles"] ? "checked" : ""}`}>
                                                <p>Women's Doubles</p>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    onChange={() => handleCheckboxChange("Women's Doubles")}
                                                />
                                                <span className="custom-checkbox"></span>
                                            </label>
                                        )}
                                    </>
                                )}
                            </div>
                            { tournamentCategories.includes("Mixed Doubles") && (
                                <label className={`tournament-button ${checkedState["Mixed Doubles"] ? "checked" : ""}`}>
                                    <p>Mixed Doubles</p>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        onChange={() => handleCheckboxChange("Mixed Doubles")}
                                    />
                                    <span className="custom-checkbox"></span>
                                </label>
                            )}
                        </div>
                    </div>
                )}

                { signupError && (
                    <p className="standard-container bg-red-500 mt-2.5">Error: {signupError.message}</p>
                )}
                { isPending ? (
                    <div className="submit flex justify-center">
                        <div className="spinner h-6 w-6"></div>
                    </div>
                ) : (
                    <>
                        { success ? (
                            <div className="success flex justify-center items-center gap-2.5">
                                <CheckIcon className="h-6 w-6" />
                                <p>Success! Redirecting to dashboard...</p>
                            </div>
                        ) : (
                            <button type="submit" 
                                className="submit"
                            >Join Tournament</button>
                        )}
                    </>
                )}
            </div>
            {/* <DialogBox isOpen={isOpen} setIsOpen={setIsOpen} /> */}
        </form>
    )
}
