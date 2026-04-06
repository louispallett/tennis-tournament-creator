"use client"

import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ForgotPasswordForm() {
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<AxiosError | null>(null);

    const onSubmit = async (data:any) => {
        setIsPending(true)
        axios.put("/api/auth/forgot-password", data)
            .then(() => {
                setSuccess(true);
            }).catch((err:any) => {
                console.log(err);
                setError(err.response.data.message);
            }).finally(() => {
                setIsPending(false);
            });
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="form">
            <div className="w-full h-full flex flex-col gap-1.5">
                <h4 className="text-center">Forgot Password</h4>
                <p>Please insert the email associated with your account.</p>
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
                    <p className="text-red-600 font-bold text-xs">{String(errors.email?.message)}</p>
                </span>
                { success ? (
                    <div className="standard-container bg-indigo-600 text-slate-50">
                        <p>Thank you - an email has been sent to your account with a new password.</p>
                    </div>
                ) : (
                    <button className="submit">
                        Submit
                    </button>
                )}
            </div>
        </form>
    )
}
