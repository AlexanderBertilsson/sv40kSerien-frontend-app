import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Profile } from "../types/utils/types/Profile";
import { useAuthContext } from "./AuthContext";
import { useUser } from "@/hooks/useUser";
import { useTeam } from "@/hooks/useTeam";

type UserContextType = {
  profile: Profile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const { user: authUser, isAuthenticated } = useAuthContext();
  const { user } = useUser(authUser?.uuid);
  const { team } = useTeam(user?.teamId);
  // Error state is handled internally; expose via context if needed.

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      if(!isAuthenticated || !user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile({...user, team: team});
      setLoading(false);
    };
    
    if (isAuthenticated && user) {
      loadUserProfile();
    }
  }, [isAuthenticated, user, team]);
  // Loads profile and team data for a given user (by uuid)



  return (
    <UserContext.Provider value={{ profile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
};
