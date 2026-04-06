"use client"

import { UserType } from "@/lib/types"
import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";

type Props = {
    details:UserType, 
    countryCodesArray:Record<string, string>
}

export default function UpdatePersonalDetailsForm({ details, countryCodesArray }:Props) {
    const form = useForm();
    const { register, control, handleSubmit, formState, watch, reset, setValue, trigger } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = async (data:any) => {
        setError(null);
        setIsPending(true);
        axios.put(`/api/auth/${details._id}/update-details`, {
            data
        }).then(() => {
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 1500);
        }).catch((err:any) => {
            console.error(err.response);
            setError(err.response.data.message);
        }).finally(() => {
            setIsPending(false);
        });
    }

    return (
        <div className="standard-container container-indigo flex flex-col gap-5">
            <h4>Update Personal Details</h4>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2.5">
                <div className="flex flex-col sm:grid grid-cols-2 gap-2.5">
                    <div>
                        <input type="text" className="form-input-no-shadow"
                            defaultValue={details.firstName} required
                            placeholder="First Name" id="firstName" 
                            {...register("firstName", {
                                required: "Required",
                                maxLength: {
                                    value: 50,
                                    message: "First name cannot be longer than a fifty (50) characters long!"
                                },
                            })}
                        />
                        <span>
                            <p className="text-red-600 font-bold mt-1.5 text-xs">{String(errors.firstName?.message)}</p>
                        </span>
                    </div>
                    <div>
                        <input type="text" placeholder="Last Name" className="form-input-no-shadow"
                            defaultValue={details.lastName} id="lastName" required
                            {...register("lastName", {
                                required: "Required",
                                maxLength: {
                                    value: 50,
                                    message: "Last name cannot be longer than a fifty (50) characters long!"
                                },
                            })}
                        />
                        <span>
                            <p className="text-red-600 font-bold mt-1.5 text-xs text-right">{String(errors.lastName?.message)}</p>
                        </span>
                    </div>
                </div>
                <div className="flex flex-col md:grid grid-cols-2 gap-2.5">
                    <div>
                        <input type="email" placeholder="Email" className="form-input-no-shadow"
                            defaultValue={details.email} required id="email" 
                            {...register("email", {
                                required: "Required",
                                maxLength: {
                                    value: 100,
                                    message: "Email cannot be longer than a hundred (100) characters long!"
                                },
                            })}
                        />
                        <span>
                            <p className="text-red-600 font-bold mt-1.5 text-xs">{String(errors.email?.message)}</p>
                        </span>
                    </div>
                    <div>
                        <div className="mobile-wrapper">
                            <div className="form-input-no-shadow">
                                <select name="countryCode" id="countryCode" defaultValue={details.mobCode}
                                    required
                                    {...register("mobCode")}
                                    className="w-full"
                                >
                                    {Object.entries(countryCodesArray).map(([code, label]) => (
                                        <option key={code} value={label}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <input type="tel" placeholder="Mobile" className="form-input-no-shadow"
                                defaultValue={details.mobile}
                                {...register("mobile", {
                                    required: "Required",
                                })}
                            />
                        </div>
                        <span>
                            <p className="text-red-600 font-bold mt-1.5 text-xs text-right">{String(errors.mobile?.message)}</p>
                        </span>
                    </div>
                </div>
                { error && (
                    <div className="standard-container bg-red-500">
                        <p>{error}</p>
                    </div>
                )}
                { isPending ? (
                    <div className="submit flex justify-center">
                        <div className="spinner h-6 w-6"></div>
                    </div>
                ) : (
                    <>
                        { success ? (
                            <div className="success flex justify-center">
                                <p>Success!</p>
                            </div>
                        ) : (
                            <button className="submit">Save</button>
                        )}
                    </>
                )}
            </form>
        </div>
    )
}
