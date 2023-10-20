/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGlobalContext } from "./context/UserProvider";
import { Roboto } from "next/font/google";
import useSWR, { mutate } from "swr";
import { FaFilter, FaCaretDown, FaMeh } from "react-icons/fa";
import { AiFillCloseCircle } from "react-icons/ai";
import { BiSolidError } from "react-icons/bi";
import _, { create, divide } from "lodash";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const baseUrl = "http://127.0.0.1:5000";

const timeGenres = ["Latest", "Oldest"];

const GetNotesFetcher = async (endpoint: string): Promise<Notes[]> => {
  const res = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    method: "GET",
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the notes.");
    throw error;
  }

  const notes: Notes[] = await res.json();
  return notes;
};

export default function Home() {
  const { user, setUser } = useGlobalContext();
  const router = useRouter();
  const [dateGenre, setDateGenre] = useState(timeGenres[0]);
  const [input, setInput] = useState("");

  const [createModal, setCreateModal] = useState(false);
  const [createInput, setCreateInput] = useState("");

  const [updateModal, setUpdateModal] = useState(false);
  const [updateInput, setUpdateInput] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState("");

  const CreateNote = async () => {
    if (createInput === "") return;

    const res = await fetch(baseUrl + "/create-note", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        note: createInput,
        userId: user?.id,
      }),
      method: "POST",
    });

    if (res.ok) {
      mutate(`${baseUrl}/get-user-notes?userId=${user?.id}`);
      setCreateModal(false);
      setCreateInput("");
    }
  };

  const UpdateNote = async () => {
    if (updateInput === "") return;

    const res = await fetch(baseUrl + "/update-note", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        noteId: selectedNoteId,
        newNote: updateInput,
        userId: user?.id,
      }),
      method: "PUT",
    });

    if (res.ok) {
      mutate(`${baseUrl}/get-user-notes?userId=${user?.id}`);
      setUpdateModal(false);
      setUpdateInput("");
    }
  };

  const DeleteNote = async (noteId: string) => {
    const res = await fetch(baseUrl + "/delete-note", {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        noteId: noteId,
        userId: user?.id,
      }),
      method: "DELETE",
    });

    if (res.ok) {
      mutate(`${baseUrl}/get-user-notes?userId=${user?.id}`);
    }
  };

  const {
    data: notes,
    error,
    isLoading,
  } = useSWR<Notes[]>(
    user && `${baseUrl}/get-user-notes?userId=${user.id}`,
    GetNotesFetcher
  );

  const handleCreateInputChange = (
    data: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setCreateInput(data.target.value);
  };

  const handleUpdateInputChange = (
    data: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setUpdateInput(data.target.value);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("session");
      if (!session) {
        router.replace("/login");
      }
    }
  }, []);

  const removeSession = () => {
    localStorage.removeItem("session");
  };

  const handleChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.currentTarget.value);
  };

  return (
    <>
      <main
        className={`${roboto.className} container mx-auto px-4 w-full h-full flex flex-col lg:px-40 py-20 gap-5`}
      >
        <div className="flex w-full justify-between text-white">
          <div className="flex flex-col">
            <div className="font-light text-2xl">
              Welcome <span className="font-bold">{user?.username}</span>
            </div>
            <div className="font-light text-base">
              Are you going to note what you&rsquo;re thinking?
            </div>
          </div>

          <div
            onClick={() => {
              removeSession();
              router.replace("/login");
              setUser(null);
            }}
            className="font-light text-base cursor-pointer"
          >
            Log out
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-bold text-slate-400 text-2xl">Your Notes</div>
          <div className="flex gap-3 items-center">
            <FaFilter className={"text-slate-400"} size={25} />
            <input
              value={input}
              onChange={handleChangeEvent}
              type="text"
              placeholder="Search..."
              className="outline-none border-none px-3 py-2 w-[220px] h-[40px] text-slate-900 bg-slate-400 font-light text-sm placeholder:text-slate-900 placeholder:font-light placeholder:text-sm rounded-default shadow-default"
            />
            <div className="group relative bg-slate-400  px-3 py-2 w-[150px] h-[40px] text-slate-900 rounded-default shadow-default">
              <div className="flex items-center justify-between gap-2 rounded-buttons cursor-pointer w-full">
                <div className={`${roboto.className} font-light`}>
                  {dateGenre}
                </div>
                <FaCaretDown />
              </div>
              <ul
                className={`${roboto.className} font-light text-base absolute w-full left-0 top-0 flex flex-col shadow-default transition-opacity duration-300 ease-in rounded-default -z-10 opacity-0 group-hover:z-10 group-hover:opacity-100`}
              >
                {timeGenres.map((val, i) => {
                  const selected: boolean =
                    timeGenres.findIndex((val) => val === dateGenre) === i;
                  if (i === 0) {
                    return (
                      <li
                        onClick={() => {
                          setDateGenre(timeGenres[i]);
                        }}
                        key={i}
                        className={`${
                          selected ? "bg-slate-400" : "bg-slate-50"
                        }  cursor-pointer transition-color duration-300 ease-in-out hover:bg-slate-400 px-3 py-2 rounded-t-default`}
                      >
                        {val}
                      </li>
                    );
                  }

                  if (i === timeGenres.length - 1) {
                    return (
                      <li
                        onClick={() => {
                          setDateGenre(timeGenres[i]);
                        }}
                        key={i}
                        className={`${
                          selected ? "bg-slate-400" : "bg-slate-50"
                        } cursor-pointer transition-color duration-300 ease-in-out hover:bg-slate-400 px-3 py-2 rounded-b-default`}
                      >
                        {val}
                      </li>
                    );
                  }

                  return (
                    <li
                      onClick={() => {
                        setDateGenre(timeGenres[i]);
                      }}
                      key={i}
                      className={`${
                        selected ? "bg-slate-400" : "bg-slate-50"
                      } cursor-pointer transition-color duration-300 ease-in-out hover:bg-slate-400 px-3 py-2`}
                    >
                      {val}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div
              onClick={() => setCreateModal(true)}
              className="h-[40px] bg-slate-400 text-slate-900 rounded-default shadow-default font-bold text-2xl px-3 py-2 flex items-center justify-center cursor-pointer transition-colors duration-300 hover:bg-slate-50"
            >
              +
            </div>
          </div>
        </div>
        <div className="w-full h-[500px] overflow-y-auto feed-y-scroll bg-slate-400 p-5 rounded-buttons shadow-default flex flex-col gap-2">
          {notes && user ? (
            notes.length >= 1 ? (
              <>
                {dateGenre === "Latest" &&
                  _.orderBy(notes, [(obj) => new Date(obj.date)], "desc").map(
                    (val) => {
                      if (
                        input !== "" &&
                        val.data.toLowerCase().includes(input.toLowerCase())
                      ) {
                        return (
                          <div
                            key={val.id}
                            className="flex flex-col justify-between items-start bg-slate-900 p-3 text-slate-400 h-[75px] rounded-default shadow-md"
                          >
                            <div className="text-lg font-normal h-[50px] break-all overflow-y-auto other-feed-y-scroll">
                              {val.data}
                            </div>
                            <div className="flex gap-4 font-light text-sm self-end">
                              <div
                                onClick={() => {
                                  setSelectedNoteId(val.id);
                                  setUpdateInput(val.data);
                                  setUpdateModal(true);
                                }}
                                className="hover:underline cursor-pointer"
                              >
                                Update
                              </div>
                              <div
                                onClick={() => DeleteNote(val.id)}
                                className="hover:underline cursor-pointer"
                              >
                                Delete
                              </div>
                              <div className="font-light text-sm">
                                {getTimeSincePostCreation(val.date.toString())}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (input === "")
                        return (
                          <div
                            key={val.id}
                            className="flex flex-col justify-between items-start bg-slate-900 p-3 text-slate-400 h-[75px] rounded-default shadow-md"
                          >
                            <div className="text-lg font-normal h-[50px] break-all overflow-y-auto other-feed-y-scroll">
                              {val.data}
                            </div>
                            <div className="flex gap-4 font-light text-sm self-end">
                              <div
                                onClick={() => {
                                  setSelectedNoteId(val.id);
                                  setUpdateInput(val.data);
                                  setUpdateModal(true);
                                }}
                                className="hover:underline cursor-pointer"
                              >
                                Update
                              </div>
                              <div
                                onClick={() => DeleteNote(val.id)}
                                className="hover:underline cursor-pointer"
                              >
                                Delete
                              </div>
                              <div className="font-light text-sm">
                                {getTimeSincePostCreation(val.date.toString())}
                              </div>
                            </div>
                          </div>
                        );
                    }
                  )}

                {dateGenre === "Oldest" &&
                  _.orderBy(notes, [(obj) => new Date(obj.date)], "asc").map(
                    (val) => {
                      if (
                        input !== "" &&
                        val.data.toLowerCase().includes(input.toLowerCase())
                      ) {
                        return (
                          <div
                            key={val.id}
                            className="flex flex-col justify-between items-start bg-slate-900 p-3 text-slate-400 h-[75px] rounded-default shadow-md"
                          >
                            <div className="text-lg font-normal h-[50px] break-all overflow-y-auto other-feed-y-scroll">
                              {val.data}
                            </div>
                            <div className="flex gap-4 font-light text-sm self-end">
                              <div
                                onClick={() => {
                                  setSelectedNoteId(val.id);
                                  setUpdateInput(val.data);
                                  setUpdateModal(true);
                                }}
                                className="hover:underline cursor-pointer"
                              >
                                Update
                              </div>
                              <div
                                onClick={() => DeleteNote(val.id)}
                                className="hover:underline cursor-pointer"
                              >
                                Delete
                              </div>
                              <div className="font-light text-sm">
                                {getTimeSincePostCreation(val.date.toString())}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (input === "")
                        return (
                          <div
                            key={val.id}
                            className="flex flex-col justify-between items-start bg-slate-900 p-3 text-slate-400 h-[75px] rounded-default shadow-md"
                          >
                            <div className="text-lg font-normal h-[50px] break-all overflow-y-auto other-feed-y-scroll">
                              {val.data}
                            </div>
                            <div className="flex gap-4 font-light text-sm self-end">
                              <div
                                onClick={() => {
                                  setSelectedNoteId(val.id);
                                  setUpdateInput(val.data);
                                  setUpdateModal(true);
                                }}
                                className="hover:underline cursor-pointer"
                              >
                                Update
                              </div>
                              <div
                                onClick={() => DeleteNote(val.id)}
                                className="hover:underline cursor-pointer"
                              >
                                Delete
                              </div>
                              <div className="font-light text-sm">
                                {getTimeSincePostCreation(val.date.toString())}
                              </div>
                            </div>
                          </div>
                        );
                    }
                  )}
              </>
            ) : (
              <div className="font-light h-full w-full flex flex-col items-center justify-center gap-2 text-slate-900">
                <div className="font-bold">¯\_(ツ)_/¯</div>
                <div>It seems like it is empty here.</div>
              </div>
            )
          ) : (
            <div className="w-full h-full font-light flex flex-col gap-2 items-center justify-center text-slate-900">
              <FaMeh size={50} />
              <div>
                Uhh, shouldn&rsquo;t you supposed to be logging in first?
              </div>
            </div>
          )}
        </div>
      </main>
      {createModal && (
        <div
          className={`${roboto.className} absolute w-full top-0 left-0 bottom-0 right-0 m-auto h-full flex items-center justify-center`}
        >
          <div className="relative bg-slate-900 w-[90%] h-[50%] md:w-[70%] sm:w-[90%] lg:w-[50%] rounded-buttons shadow-default flex flex-col gap-2 text-slate-50 text-sm font-light z-20 p-5">
            <div className="font-bold text-slate-400 text-2xl">Add a note</div>
            <textarea
              value={createInput}
              onChange={handleCreateInputChange}
              className={`${roboto.className} font-normal text-lg h-full outline-none p-2 rounded-default w-full bg-slate-400 text-slate-900 resize-none shadow-default`}
            ></textarea>
            <button
              onClick={CreateNote}
              className="bg-slate-400 text-slate-900 p-4 rounded-default shadow-default transition-transform hover:-translate-y-[2px]"
            >
              Save changes
            </button>
            <AiFillCloseCircle
              onClick={() => {
                setCreateModal(false);
                setCreateInput("");
              }}
              className="absolute top-2 right-2 cursor-pointer text-slate-400"
              size={20}
            />
          </div>
          <div className="absolute z-10 bg-slate-950 opacity-60 blur-sm h-full w-full rounded-buttons"></div>
        </div>
      )}

      {updateModal && (
        <div
          className={`${roboto.className} absolute w-full top-0 left-0 bottom-0 right-0 m-auto h-full flex items-center justify-center`}
        >
          <div className="relative bg-slate-900 w-[90%] h-[50%] md:w-[70%] sm:w-[90%] lg:w-[50%] rounded-buttons shadow-default flex flex-col gap-2 text-slate-50 text-sm font-light z-20 p-5">
            <div className="font-bold text-slate-400 text-2xl">
              Update a note
            </div>
            <textarea
              value={updateInput}
              onChange={handleUpdateInputChange}
              className={`${roboto.className} font-normal text-lg h-full outline-none p-2 rounded-default w-full bg-slate-400 text-slate-900 resize-none shadow-default`}
            ></textarea>
            <button
              onClick={UpdateNote}
              className="bg-slate-400 text-slate-900 p-4 rounded-default shadow-default transition-transform hover:-translate-y-[2px]"
            >
              Save changes
            </button>
            <AiFillCloseCircle
              onClick={() => {
                setUpdateModal(false);
                setUpdateInput("");
              }}
              className="absolute top-2 right-2 cursor-pointer text-slate-400"
              size={20}
            />
          </div>
          <div className="absolute z-10 bg-slate-950 opacity-60 blur-sm h-full w-full rounded-buttons"></div>
        </div>
      )}
    </>
  );
}

const getTimeSincePostCreation = (created_at: string): string => {
  const postCreatedAt = new Date(created_at);
  const currentTime = new Date();

  const timeDifference = currentTime.getTime() - postCreatedAt.getTime();

  // Calculate time units
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  // Return a formatted string
  if (weeks > 0) {
    return `${weeks}w ago`;
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};
