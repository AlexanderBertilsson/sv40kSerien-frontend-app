import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuthRequest, ResponseType, TokenResponse, AccessTokenRequestConfig, exchangeCodeAsync } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from "axios";
import mockData from '../mock-data.json';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';

const clientId = '2lg4jikgmjccck95t78lf4g3jc';
const userPoolUrl = 'https://eu-north-1qq0zhyyi5.auth.eu-north-1.amazoncognito.com';
const redirectUri = 'myapp://';

export type User = {
  username?: string;
  email?: string;
  uuid?: string; 
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

  // Restore authTokens and user uuid from SecureStore on mount (device only)
  // useEffect(() => {
  //   const restoreFromStorage = async () => {
  //     if (Platform.OS !== 'web') {
  //       try {
  //         const accessToken = await SecureStore.getItemAsync('accessToken');
  //         const idToken = await SecureStore.getItemAsync('idToken');
  //         const refreshToken = await SecureStore.getItemAsync('refreshToken');
  //         const uuid = await SecureStore.getItemAsync('userUuid');
  //         if (accessToken && idToken && refreshToken) {
  //           setAuthTokens({
  //             accessToken,
  //             idToken,
  //             refreshToken,
  //             tokenType: 'bearer',
  //             expiresIn: 3600,
  //             scope: 'openid profile email'
  //           } as TokenResponse);
  //         }
  //         if (uuid) {
  //           setUser((prev) => ({ ...(prev || {}), uuid }));
  //         }
  //       } catch (err) {
  //         console.error('Failed to restore tokens from SecureStore', err);
  //       }
  //     }
  //   };
  //   restoreFromStorage();
  // }, []);

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

  // On device: decode accessToken, extract uuid, and store tokens/uuid in SecureStore
  useEffect(() => {
    const storeTokensAndUuid = async () => {
      if (Platform.OS !== 'web' && authTokens?.accessToken) {
        try {
          const decoded: { sub: string } = jwtDecode(authTokens.accessToken);
          setUser((prev) => ({ ...(prev || {}), uuid: decoded.sub }));
          await SecureStore.setItemAsync('userUuid', decoded.sub);
          await SecureStore.setItemAsync('accessToken', authTokens.accessToken);
          if(authTokens.idToken )
            await SecureStore.setItemAsync('idToken', authTokens.idToken);
          if(authTokens.refreshToken)
            await SecureStore.setItemAsync('refreshToken', authTokens.refreshToken);
        } catch (err) {
          setError('Failed to decode token or store in SecureStore');
          console.error(err);
        }
      }
    };
    storeTokensAndUuid();
  }, [authTokens]);
  
const login = useCallback(async () => {
  console.log("login");
    try {
      if (Platform.OS === 'web') {
        setUser({
          username: mockData.users[5].username,
          email: mockData.users[5].email,
          uuid: "f4a5b6c7-8d9e-0f1a-2b3c-4d5e6f7a8b9c"
        });
        setAuthTokens(new TokenResponse({
          accessToken: "mock-access-token",
          idToken: "mock-id-token",
          refreshToken: "mock-refresh-token",
          tokenType: "bearer",
          expiresIn: 3600,
          scope: "openid profile email"
        }));
        // window.location.href = `${userPoolUrl}/oauth2/authorize?` +
        //   `client_id=${clientId}&` +
        //   `response_type=code&` +
        //   `redirect_uri=https://ymun8qwnt1.execute-api.eu-north-1.amazonaws.com/oauth2/callback`;
      } else {
        console.log("prompt");
        await promptAsync();
      }
    } catch (error) {
      setError('Failed to start login flow');
      console.error('Login error:', error);
    }
  }, [promptAsync, setError]);

  const logout = useCallback(async () => {
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
  }, [authTokens, discoveryDocument.revocationEndpoint]);

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
