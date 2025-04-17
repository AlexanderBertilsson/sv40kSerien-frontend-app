import { useState, useEffect } from 'react';
import { Team } from '@/types/utils/types/Team';
import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
/* eslint-disable no-undef*/

export function useTeam(teamId: number | undefined, authTokens: any) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId || !authTokens?.idToken) return;
    setLoading(true);

    const fetchTeam = async () => {
      try {
        const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
        const res = await fetch(`${url}/teams/${teamId}`, {
          headers: {
            'Authorization': `Bearer ${authTokens.accessToken}`
          }
        });
        const data = await res.json();
        setTeam(data);
      } catch (_err) {
        console.log(_err);
        setError('Failed to fetch team data');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId, authTokens]);

  return { team, loading, error };
}
