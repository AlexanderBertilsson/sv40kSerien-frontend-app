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
  const { userQuery } = useUser(authUser?.uuid);
  const { teamQuery } = useTeam(userQuery.data?.teamId || '');
  // Error state is handled internally; expose via context if needed.

  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      if(!isAuthenticated || !userQuery.data) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // Only set profile if both user and team data are available
      if (teamQuery.data) {
        setProfile({
          ...userQuery.data, 
          team: teamQuery.data
        });
      } else {
        // Handle case where team data is not available
        setProfile(null);
      }
      setLoading(false);
    };
    
    loadUserProfile();
  }, [isAuthenticated, userQuery.data, teamQuery.data]);
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
