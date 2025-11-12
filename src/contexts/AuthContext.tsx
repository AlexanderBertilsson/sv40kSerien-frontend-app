import { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuthRequest, ResponseType, TokenResponse, AccessTokenRequestConfig, exchangeCodeAsync, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import { ENV } from "../config/environment";
import apiClient from '@/src/components/httpClient/httpClient';
import { useMe } from '@/src/hooks/useMe';
import { Profile } from '@/types/User';

const clientId = ENV.clientId;
const userPoolUrl = ENV.userPoolUrl;
const redirectUri = makeRedirectUri();
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  authUser: Profile | null;
  isAuthenticated: boolean;
  authTokens: TokenResponse | null;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [authTokens, setAuthTokens] = useState<TokenResponse | null>(null);
  const [authUser, setAuthUser] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);


  // Restore authTokens and user uuid from SecureStore on mount (device only)
  useEffect(() => {
    const restoreFromStorage = async () => {
      if (Platform.OS !== 'web') {
        try {
          const accessToken = await SecureStore.getItemAsync('accessToken');
          const idToken = await SecureStore.getItemAsync('idToken');
          const refreshToken = await SecureStore.getItemAsync('refreshToken');

          if (accessToken && idToken && refreshToken) {
            setAuthTokens({
              accessToken,
              idToken,
              refreshToken,
              tokenType: 'bearer',
              expiresIn: 3600,
              scope: 'openid profile email'
            } as TokenResponse);

            const response = await apiClient.get('/users/me');
            if(response.status === 200) {
              const data = response.data;
              setAuthUser(data);
            }
          }
        } catch (err) {
          console.error('Failed to restore tokens from SecureStore', err);
        }
      }
      setIsInitialized(true);
    };
    restoreFromStorage();
  }, []);

  useEffect(() => {
    const GetSession = async () => {
      if(Platform.OS !== 'web') {
        return;
      }
      try {
        const response = await apiClient.get('/users/me')
        if(response.status === 200) {
          const data = response.data;
          setAuthUser(data);
        }
      } catch (error) {
        console.error('Failed to get session', error);
      }
      setIsInitialized(true);
    }
    GetSession();
  }, []);

  // Use the useMe hook for automatic polling and synchronization
  const { user: meUser, refetch: refetchMe } = useMe({
    enabled: isInitialized && !!authUser, // Only poll when user is authenticated
    refetchInterval: 5 * 60 * 1000, // Poll every 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to app
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: false, // Don't retry on failure (user might be logged out)
  });

  // Sync authUser state with useMe hook data
  useEffect(() => {
    if (meUser && isInitialized) {
      setAuthUser(meUser);
    }
  }, [meUser, isInitialized]);


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
      if(Platform.OS === 'web') {
        const res = await apiClient.get('/auth/code?Code=' + exchangeTokenReq.code + "&RedirectUri=" + exchangeTokenReq.redirectUri + "&ClientId=" + exchangeTokenReq.clientId + "&CodeVerifier=" + exchangeTokenReq?.extraParams?.code_verifier);
        
        const data = res.data;
        setAuthUser(data.user);
      } else {
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
    }
      
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
          // Fetch full user profile after token decode
          const response = await apiClient.get('/users/me');
          if(response.status === 200) {
            setAuthUser(response.data);
          }
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
  
const login = useCallback(() => {
    try {
      promptAsync().catch(error => {
        setError('Failed to start login flow');
        console.error('Login error:', error);
      });
    } catch (error) {
      setError('Failed to start login flow');
      console.error('Login error:', error);
    }
  }, [promptAsync, setError]);

  const logout = useCallback(async () => {
    try {
      const response = await apiClient.post('/auth/logout', {
        ClientId: clientId,
        IsWeb: Platform.OS === 'web',
        Token: authTokens?.refreshToken,
        LogoutUri: redirectUri,
    });
    if(response.status === 200) {
      setAuthTokens(null);
      setAuthUser(null);
      setError(null);
      window.location.href = userPoolUrl + '/logout?client_id=' + clientId + '&logout_uri=' + redirectUri;
    }
    } catch (error) {
      setError('Failed to logout');
      console.error('Logout error:', error);
    }
  }, [authTokens]);

  // Manual refresh function for immediate updates after mutations
  const refreshProfile = useCallback(async () => {
    try {
      await refetchMe();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [refetchMe]);

  const value = useMemo(() => ({
    authUser,
    isAuthenticated: !!authUser,
    authTokens,
    error,
    login,
    logout,
    refreshProfile,
  }), [authUser, authTokens, error, login, logout, refreshProfile]);

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
