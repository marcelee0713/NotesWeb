"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ZodType, z } from "zod";
import { baseUrl } from "../page";
import Link from "next/link";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const SignUpPage = () => {
  const [visible, setVisible] = useState(false);
  const [cfrmVisible, setCfrmVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  type FormData = {
    username: string;
    password: string;
    cfrmPassword: string;
  };

  const schema: ZodType<FormData> = z
    .object({
      username: z
        .string()
        .min(1, { message: "Please provide a username" })
        .min(6, { message: "Must contain at least 6 character(s)" })
        .max(75),
      password: z
        .string()
        .min(1, { message: "Please provide a password" })
        .min(6, { message: "Must contain at least 6 character(s)" })
        .max(100),
      cfrmPassword: z
        .string()
        .min(1, { message: "Please provide an input" })
        .min(6, { message: "Must contain at least 6 character(s)" })
        .max(100),
    })
    .refine((data) => data.password === data.cfrmPassword, {
      message: "Passwords do not match",
      path: ["cfrmPassword"],
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submitData = async (data: FormData) => {
    setSuccess(false);
    setError("");

    const res = await fetch(baseUrl + "/sign-up", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username: data.username,
        password: data.password,
      }),
      method: "POST",
    });

    if (res.ok) {
      setError("");
      setSuccess(true);
    } else {
      const obj: ResponseMessage = await res.json();
      setSuccess(false);
      setError(obj.message);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      router.replace("/");
    }
  }, []);

  return (
    <main
      className={`${roboto.className} h-full w-full text-white flex flex-col gap-3 items-center justify-center`}
    >
      <form
        onSubmit={handleSubmit(submitData)}
        className="text-slate-900 flex flex-col gap-5 bg-slate-50 w-[300px] h-fit rounded-default shadow-default p-5 items-stretch relative"
      >
        <div className="self-center text-slate-900 font-bold text-2xl">
          Create an account
        </div>

        <div className="flex flex-col gap-1 text-slate-900">
          <label htmlFor="user_id" className="font-bold text-accent">
            Username
          </label>
          <input
            type="text"
            className={`${!errors.username && "border border-slate-400"} ${
              errors.username && "border-2 border-rose-400"
            } outline-none bg-transparent rounded-default  p-2 text-accent font-bold`}
            {...register("username")}
          />
          <span
            className={`text-rose-400 duration-300 opacity-0 ease-in text-xs ${
              errors.username && `opacity-100`
            }`}
          >
            {errors.username && errors.username.message}
          </span>
        </div>

        <div>
          <label htmlFor="password" className="font-bold text-accent">
            Password
          </label>
          <div className="flex items-center relative">
            <input
              type={visible ? "text" : "password"}
              className={`${errors.password && "border-rose-400 border-2"}  ${
                !errors.password && "border border-slate-400"
              }  outline-none p-2 rounded-default w-full bg-transparent text-accent font-bold`}
              {...register("password")}
            />
            {!visible && (
              <FaEyeSlash
                className="absolute right-0 mr-2"
                size={25}
                onClick={() => setVisible(true)}
              />
            )}
            {visible && (
              <FaEye
                className="absolute right-0 mr-2"
                size={25}
                onClick={() => setVisible(false)}
              />
            )}
          </div>
          <span
            className={`text-rose-400 duration-300 opacity-0 ease-in text-xs ${
              errors.password && `opacity-100`
            }`}
          >
            {errors.password && errors.password.message}
          </span>
        </div>

        <div>
          <label htmlFor="cpassword" className="font-bold text-accent">
            Confirm Password
          </label>
          <div className="flex items-center relative">
            <input
              type={cfrmVisible ? "text" : "password"}
              className={`${
                errors.cfrmPassword && "border-rose-400 border-2"
              } ${
                !errors.cfrmPassword && "border border-slate-400"
              }  outline-none p-2 rounded-default w-full bg-transparent text-accent font-bold`}
              {...register("cfrmPassword")}
            />
            {!cfrmVisible && (
              <FaEyeSlash
                className="absolute right-0 mr-2"
                size={25}
                onClick={() => setCfrmVisible(true)}
              />
            )}
            {cfrmVisible && (
              <FaEye
                className="absolute right-0 mr-2"
                size={25}
                onClick={() => setCfrmVisible(false)}
              />
            )}
          </div>
          <span
            className={`text-rose-400 duration-300 opacity-0 ease-in text-xs ${
              errors.cfrmPassword && `opacity-100`
            }`}
          >
            {errors.cfrmPassword && errors.cfrmPassword.message}
          </span>
        </div>

        <input
          type="submit"
          value={"Create"}
          className="bg-slate-400 bg-accent p-3 self-center font-bold text-slate-900 w-40 rounded-buttons shadow-md cursor-pointer transition-transform duration-300 hover:-translate-y-1"
        />

        {error && <div className="text-rose-400 self-center">{error}</div>}
        {success && (
          <div className="absolute h-full w-full gap-5 bg-slate-900 rounded-default shadow-default self-center text-center top-0 text-slate-50 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold">
              You&rsquo;ve successfully created an account!
            </div>
            <Link
              href={"/login"}
              replace={true}
              className="font-light self-center hover:underline"
            >
              Go to log in
            </Link>
          </div>
        )}
      </form>
      <Link
        href={"/login"}
        replace={true}
        className="font-light self-center hover:underline"
      >
        Log in
      </Link>
    </main>
  );
};

export default SignUpPage;
