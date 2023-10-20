"use client";
import {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";

interface UserProviderProps {
  children: ReactNode;
}

export type Credential = null | { id: string; username: string };
type CredentialTypes = {
  user: Credential;
  setUser: (credential: Credential) => void;
};

export const UserContext = createContext<CredentialTypes>({
  user: null,
  setUser: (credential: Credential) => {},
});

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Credential>(null);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      const obj: Credential = JSON.parse(session);
      setUser(obj);
    } else {
      setUser(null);
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: (user: Credential) => {
          setUser(user);
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useGlobalContext = () => useContext(UserContext);
