"use client"

import axios from "axios";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";

type SignUpFormProps = {
    countryCodesArray:Record<string, string>;
}

export default function SignUpForm({ countryCodesArray }:SignUpFormProps) {
    const form = useForm();
    const { register, control, handleSubmit, formState, watch, reset, setValue, trigger } = form;
    const { errors } = formState;
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signupError, setSignupError] = useState(null);

    const onSubmit = async (data:any) => {
        setSignupError(null);
        setIsPending(true);
        axios.post("/api/auth/register", data)
            .then(() => {
                axios.post("/api/auth", data)
                    .then(() => {
                        window.location.assign("/dashboard");
                    }).catch((err) => {
                        console.log(err);
                        setSignupError(err)
                    })
            }).catch((err) => {
                console.log(err);
                setSignupError(err);
            }).finally(() => {
                setIsPending(false);
            });

    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="form">
            <div className="relative w-full h-full flex flex-col gap-2.5">
                <h3 className="font-roboto text-center">Create an account</h3>
                <div className="form-grid">
                    <div>
                        <input type="text" placeholder="First Name" className="form-input"
                            required id="firstName" {...register("firstName", {
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
                        <input type="text" placeholder="Last Name" className="form-input"
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
                <div className="form-grid">
                    <div>
                        <input type="email" placeholder="Email" className="form-input"
                            required id="email" {...register("email", {
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
                            <div className="form-input">
                                <select name="countryCode" id="countryCode"
                                    required defaultValue="GB: +44"
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
                            <input type="tel" placeholder="Mobile" className="form-input"
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
                <div className="form-grid">
                    <div>
                        <div>
                            <input type={showPassword ? "text" : "password"} id="password" autoComplete="current-password" required placeholder="Password"
                                {...register("password", {
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
                                className="form-input"
                            />
                            <span>
                                <p className="text-red-600 font-bold mt-1.5 text-xs">{String(errors.password?.message)}</p>
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="form-input flex gap-1.5">
                            <input type={showPassword ? "text" : "password"} id="confPassword" required placeholder="Confirm Password"
                                {...register("confPassword", {
                                    required: "Required",
                                    validate: {
                                        passwordMatch: (fieldValue) => {
                                            return (
                                                fieldValue == watch("password") || "Passwords do not match"
                                            )
                                        }
                                    }
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
                            <p className="text-red-600 font-bold mt-1.5 text-xs text-right">{String(errors.confPassword?.message)}</p>
                        </span>
                    </div>
                </div>
                { isPending ? (
                    <div className="submit flex justify-center">
                        <div className="spinner h-6 w-6"></div>
                    </div>
                ) : (
                    <button type="submit" 
                        className="submit"
                    >Sign Up</button>
                )}
                { signupError && (
                    <p className="standard-container bg-red-500">{signupError.response.data.message}</p>
                )}
            </div>
            {/* <DialogBox isOpen={isOpen} setIsOpen={setIsOpen} /> */}
        </form>
    )
}
