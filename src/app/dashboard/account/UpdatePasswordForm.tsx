"use client"

import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";

type Props = {
    userId:string
}

export default function UpdatePasswordForm({ userId }:Props) {
    const form = useForm();
    const { register, control, handleSubmit, formState, watch, reset, setValue, trigger } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);

    const onSubmit = async (data:any) => {
        setError(false);
        setIsPending(true);
        axios.put(`/api/auth/${userId}/update-password`, {
            data
        }).then(() => {
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 1500);
            reset();
        }).catch((err:any) => {
            console.error(err.response.data.message);
            setError(err.response.data.message);
        }).finally(() => {
            setIsPending(false);
        });
    }

    return (
        <div className="standard-container container-indigo flex flex-col gap-5">
            <h4>Update Password</h4>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2.5">
                <div className="flex flex-col sm:grid grid-cols-2 gap-2.5">
                    <div>
                        <input type={showPassword ? "text" : "password"} id="currentPassword" autoComplete="current-password" required placeholder="Current Password"
                            {...register("currentPassword", {
                                required: "Required",
                            })}
                            className="form-input-no-shadow"
                        />
                        <span>
                            <p className="text-red-600 font-bold mt-1.5 text-xs">{String(errors.currentPassword?.message)}</p>
                        </span>
                    </div>
                    <div>
                        <div className="form-input-no-shadow flex gap-1.5">
                            <input type={showPassword ? "text" : "password"} id="newPassword" required placeholder="New Password"
                                {...register("newPassword", {
                                    required: "Required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least eight (8) characters long"
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
                                        message: "Must contain: uppercase, lowercase, number, and special character"
                                    },
                                })}
                                className="w-full"
                            />
                            { showPassword ? (
                                <EyeIcon onClick={() => setShowPassword(false)} className="w-6 h-6 cursor-pointer hover:opacity-50" />
                            ) : (
                                <EyeSlashIcon onClick={() => setShowPassword(true)} className="w-6 h-6 cursor-pointer hover:opacity-50" />
                            )}
                        </div>
                        <span>
                            <p className="text-red-600 font-bold mt-1.5 text-xs text-right">{String(errors.newPassword?.message)}</p>
                        </span>
                    </div>
                </div>
                { error && (
                    <div className="standard-container bg-red-500">{error}</div>
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
                            <button className="submit">Update Password</button>
                        )}
                    </>
                )}
            </form>
        </div>
    )
}
