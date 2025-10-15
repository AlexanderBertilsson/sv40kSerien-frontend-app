import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Profile } from "../../types/Profile";
import { useAuthContext } from "./AuthContext";
import { useTeam } from "@/src/hooks/useTeam";

type UserContextType = {
  profile: Profile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const { authUser, isAuthenticated } = useAuthContext();
  // const { userQuery } = useUser(authUser?.uuid);
  const { teamQuery } = useTeam(authUser?.teamId || '');
  // Error state is handled internally; expose via context if needed.

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      if(!isAuthenticated || !authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setProfile({
        ...authUser,
        team: teamQuery.data || undefined 
      });
      setLoading(false);
    };
    
    loadUserProfile();
  }, [isAuthenticated, teamQuery.data, authUser]);
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
