"use client"

import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

export default function SignIn() {
    const form = useForm();
    const { register, control, handleSubmit, formState, watch, reset, setValue, trigger } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data:any) => {
        setIsPending(true)
        axios.post("/api/auth", data)
            .then(() => {
                window.location.assign("/dashboard");
            }).catch((err:any) => {
                console.log(err);
                setLoginError(err);
                setIsPending(false);
            });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="form">
            <div className="w-full h-full flex flex-col gap-2.5">
                <div className="flex flex-col md:grid grid-cols-2 gap-2.5">
                    <div>
                        <input type="email" className="form-input-no-shadow" placeholder="Email"
                            {...register ("email", {
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
                        <div className="form-input-no-shadow flex gap-1.5">
                            <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full"
                                {...register ("password", {
                                    required: "Required",
                                })}
                            />
                            { showPassword ? (
                                <EyeIcon className="w-6 h-6 cursor-pointer hover:opacity-50"
                                    onClick={() => setShowPassword(false)}
                                />
                            ) : (
                                <EyeSlashIcon className="w-6 h-6 cursor-pointer hover:opacity-50"
                                    onClick={() => setShowPassword(true)}
                                />
                            )}
                        </div>
                        <span>
                            <p className="text-red-600 font-bold mt-1.5 text-xs">{String(errors.password?.message)}</p>
                        </span>
                    </div>
                </div>
                <Link href="/home/auth/forgot-password" className="text-right text-sm">Forgot Password?</Link>
                { loginError && (
                    <p className="standard-container bg-red-500">{loginError.response.data.message}</p>
                )}
                { isPending ? (
                    <div className="submit flex justify-center items-center">
                        <div className="spinner h-6 w-6"></div>
                    </div>
                ) : (
                    <button type="submit" 
                        className="submit"
                    >Login</button>
                )}
            </div>
        </form>
    )
}
