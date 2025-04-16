import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuthRequest, ResponseType, TokenResponse, AccessTokenRequestConfig, exchangeCodeAsync } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from "axios";

const clientId = '2lg4jikgmjccck95t78lf4g3jc';
const userPoolUrl = 'https://eu-north-1qq0zhyyi5.auth.eu-north-1.amazoncognito.com';
const redirectUri = 'myapp://login';

export type User = {
  username: string;
  email: string;
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  authTokens: TokenResponse | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  WebBrowser.maybeCompleteAuthSession();
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
          platform: Platform.OS,
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

  const login = async () => {
    try {
      if (Platform.OS === 'web') {
        window.location.href = `${userPoolUrl}/oauth2/authorize?` +
          `client_id=${clientId}&` +
          `response_type=code&` +
          `redirect_uri=https://ymun8qwnt1.execute-api.eu-north-1.amazonaws.com/oauth2/callback`;
      } else {
        await promptAsync();
      }
    } catch (error) {
      setError('Failed to start login flow');
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      if (authTokens?.refreshToken) {
        await axios.post(discoveryDocument.revocationEndpoint + `?client_id=${clientId}&logout_uri=${redirectUri}`, {
          body: {
            client_id: clientId,
            logout_uri: redirectUri,
            token: authTokens.refreshToken,
          }
        }).catch(error => {
          setError('Failed to logout');
          console.error('Logout error:', error);
        });
      }
      setAuthTokens(null);
      setUser(null);
      setError(null);
    } catch (error) {
      setError('Failed to logout');
      console.error('Logout error:', error);
    }
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    authTokens,
    error,
    login,
    logout,
  }), [user, authTokens, error, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
