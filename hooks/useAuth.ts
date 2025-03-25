import { useState, useMemo, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuthRequest, exchangeCodeAsync, revokeAsync, ResponseType, AccessTokenRequestConfig, TokenResponse, makeRedirectUri } from 'expo-auth-session';
import axios from "axios";

const clientId = '2lg4jikgmjccck95t78lf4g3jc';
const userPoolUrl = 'https://eu-north-1qq0zhyyi5.auth.eu-north-1.amazoncognito.com';
const redirectUri = 'myapp://';

export type User = {
  username: string;
  email: string;
}

export function useAuth() {
  const [authTokens, setAuthTokens] = useState<TokenResponse | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const discoveryDocument = useMemo(() => ({
    authorizationEndpoint: userPoolUrl + '/oauth2/authorize',
    tokenEndpoint: userPoolUrl + '/oauth2/token',
    revocationEndpoint: userPoolUrl + '/oauth2/revoke',
  }), []);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      responseType: ResponseType.Code,
      redirectUri,
      usePKCE: true,
    },
    discoveryDocument
  );

  const login = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, use window.location to handle redirect
        window.location.href = `${userPoolUrl}/oauth2/authorize?` +
          `client_id=${clientId}&` +
          `response_type=code&` +
          `redirect_uri=https://ymun8qwnt1.execute-api.eu-north-1.amazonaws.com/oauth2/callback`;
      } else {
        // For native, use expo-auth-session
        await promptAsync();
      }
    } catch (error) {
      setError('Failed to start login flow');
      console.error(error);
    }
  };

  useEffect(() => {
    const exchangeFn = async (exchangeTokenReq: AccessTokenRequestConfig) => {
      try {
        const exchangeTokenResponse = await exchangeCodeAsync(
          exchangeTokenReq,
          discoveryDocument
        );
        setAuthTokens(exchangeTokenResponse);
        setError(null);
      } catch (error) {
        setError('Failed to exchange code for tokens');
        console.error(error);
      }
    };

    if (response?.type === 'error') {
      setError(response.params.error_description || 'Authentication failed');
      return;
    }

    if (response?.type === 'success') {
      if (!request?.codeVerifier) {
        setError('Code verifier is missing');
        return;
      }

      exchangeFn({
        clientId,
        code: response.params.code,
        redirectUri,
        extraParams: {
          code_verifier: request.codeVerifier,
        },
      });
    }
  }, [discoveryDocument, request, response]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user && authTokens?.accessToken) {
        try {
          const res = await axios.get(userPoolUrl + '/oauth2/userinfo', {
            headers: { "Authorization": "Bearer " + authTokens.accessToken }
          });
          setUser(res.data);
          setError(null);

          // Store token in cookie if on web platform
          if (Platform.OS === 'web') {
            document.cookie = `accessToken=${authTokens.accessToken}; path=/; secure; samesite=strict`;
          }
        } catch (error) {
          setError('Failed to fetch user info');
          console.error(error);
        }
      }
    };

    fetchUserInfo();
  }, [authTokens, user]);

  const logout = async () => {
    if (!authTokens?.refreshToken) return;

    try {
      const revokeResponse = await revokeAsync(
        {
          clientId,
          token: authTokens.refreshToken,
        },
        discoveryDocument
      );

      if (revokeResponse) {
        setAuthTokens(null);
        setUser(null);
        setError(null);

        // Clear cookie if on web platform
        if (Platform.OS === 'web') {
          document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
      }
    } catch (error) {
      setError('Failed to logout');
      console.error(error);
    }
  };

  return {
    user,
    error,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
