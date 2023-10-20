"use client";
import { Roboto } from "next/font/google";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ZodType, z } from "zod";
import { baseUrl } from "../page";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { Credential, useGlobalContext } from "../context/UserProvider";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const LogInPage = () => {
  const { user, setUser } = useGlobalContext();
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  type FormData = {
    username: string;
    password: string;
  };

  const schema: ZodType<FormData> = z.object({
    username: z.string().min(1, { message: "Please provide a username" }),
    password: z.string().min(1, { message: "Please provide a password" }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submitData = async (data: FormData) => {
    setError("");

    await fetch(baseUrl + "/login", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username: data.username,
        password: data.password,
      }),
      method: "POST",
    })
      .then(async (res) => {
        if (res.ok) {
          return await res.json();
        } else {
          const errRes: ResponseMessage = await res.json();
          throw Error(errRes.message);
        }
      })
      .then((val) => {
        console.log(val);
        const login: Credential = val;
        setUser(login);
        router.replace("/");

        localStorage.setItem("session", JSON.stringify(val));
      })
      .catch((e) => {
        setError(e.message);
      });
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
      <div className="flex flex-col font-light text-2xl w-[300px]">
        <div className="self-start">
          Welcome to
          <span className="font-bold text-slate-400"> Noted</span>
        </div>
        <div className="text-base">
          Is there something you need to note it out?
        </div>
      </div>
      <form
        onSubmit={handleSubmit(submitData)}
        className="text-slate-900 flex flex-col gap-5 bg-slate-50 w-[300px] h-fit rounded-default shadow-default p-5 items-stretch"
      >
        <div className="self-center text-slate-900 font-bold text-2xl">
          Login
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
            className={`text-secondary duration-300 opacity-0 ease-in text-xs ${
              errors.username && `opacity-100`
            }`}
          >
            {errors.username && errors.username.message}
          </span>
        </div>

        <div className="flex flex-col gap-1 text-slate-900">
          <label htmlFor="pass" className="font-bold text-accent">
            Password
          </label>
          <div className="flex items-center relative">
            <input
              type={visible ? "text" : "password"}
              className={`${!errors.password && "border border-slate-400"} ${
                errors.password && "border-2 border-rose-400"
              } outline-none bg-transparent rounded-default p-2 text-accent font-bold w-full`}
              {...register("password")}
            />
            {!visible && (
              <FaEyeSlash
                className="absolute right-0 mr-2 text-secondary"
                size={25}
                onClick={() => setVisible(true)}
              />
            )}
            {visible && (
              <FaEye
                className="absolute right-0 mr-2 text-secondary"
                size={25}
                onClick={() => setVisible(false)}
              />
            )}
          </div>
          <span
            className={`text-secondary duration-300 opacity-0 ease-in text-xs ${
              errors.password && `opacity-100`
            }`}
          >
            {errors.password && errors.password.message}
          </span>
        </div>

        <input
          type="submit"
          value={"Log In"}
          className="bg-slate-400 bg-accent p-3 self-center font-bold text-slate-900 w-40 rounded-buttons shadow-md cursor-pointer transition-transform duration-300 hover:-translate-y-1"
        />

        {error && <div className="text-rose-400 self-center">{error}</div>}
      </form>
      <Link href={"/signup"} className="font-light self-center hover:underline">
        Create an account
      </Link>
    </main>
  );
};

export default LogInPage;
