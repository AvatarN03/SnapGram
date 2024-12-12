import { getCurrentUser } from "@/lib/appwrite/api";
import { account } from "@/lib/appwrite/config";
import { IContextType, IUser } from "@/types";
import React, { useEffect, useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const INITIAL_USER = {
  id: "",
  name: "",
  email: "",
  imageUrl: "",
  bio: "",
  username: "",
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  const checkAuthUser = async () => {
    try {
      const currentUser = await getCurrentUser();

      if (currentUser) {
        setUser({
          id: currentUser.$id,
          name: currentUser.name,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl,
          bio: currentUser.bio,
          username: currentUser.username,
        });

        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      localStorage.getItem("cookieFallback") === "[]" ||
      localStorage.getItem("cookieFallback") === null
    )
      navigate("/sign-in");
    checkAuthUser();
  }, []);

  // useEffect(() => {
  //   // Define an async function inside useEffect
  //   const deleteSessions = async () => {
  //     try {
  //       await account.deleteSessions();
  //       console.log("Sessions cleared.");
  //     } catch (error) {
  //       console.error("Error clearing sessions:", error);
  //     }
  //   };

  //   // Call the async function
  //   deleteSessions();
  // }, []); // Empty dependency array ensures this runs only once


  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuthContext = () => {
  return useContext(AuthContext);
};
