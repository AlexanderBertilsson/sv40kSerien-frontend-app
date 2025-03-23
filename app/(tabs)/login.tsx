import { useState, useMemo, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, exchangeCodeAsync, revokeAsync, ResponseType, AccessTokenRequestConfig, TokenResponse } from 'expo-auth-session';
import { Button, Alert, View, Text } from 'react-native';
import axios  from "axios"

WebBrowser.maybeCompleteAuthSession();

const clientId = '2lg4jikgmjccck95t78lf4g3jc';
const userPoolUrl = 'https://eu-north-1qq0zhyyi5.auth.eu-north-1.amazoncognito.com';
const redirectUri = 'myapp://';
type User = {
  username: string,
  email: string,
}
export const [user, setUser] = useState<User | null>(null);


export default function LoginScreen() {
  const [authTokens, setAuthTokens] = useState<TokenResponse | null>(null);
  const discoveryDocument = useMemo(() => ({
    authorizationEndpoint: userPoolUrl + '/oauth2/authorize',
    tokenEndpoint: userPoolUrl + '/oauth2/token',
    revocationEndpoint: userPoolUrl + '/oauth2/revoke',
  }), []);
  console.log(authTokens);
  
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      responseType: ResponseType.Code,
      redirectUri,
      usePKCE: true
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
      } catch (error) {
        console.error(error);
      }
    };
    if (response && (response.type === 'error' || response.type === 'success')) {
      if (response.error) {
        Alert.alert(
          'Authentication error',
          response.params.error_description || 'something went wrong'
        );
        return;
      }
      if (response.type === 'success') {
        if(request == null){
          Alert.alert('Authentication error',
            'request is null'
          )
          return;
        }
        if(!request.codeVerifier){
          Alert.alert('Authentication error',
            'request.codeVerifier is undefined'
          )
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
    }
  }, [discoveryDocument, request, response]);

  useEffect(() => {
    if(!user && authTokens){
      axios.get(userPoolUrl + '/oauth2/userinfo', {headers: {"Authorization": "Bearer "+authTokens.accessToken}}).then((res) => {
       
        setUser(res.data);
      })
    }
  }, [authTokens])

  const logout = async () => {
    console.log('authTokens: ' + JSON.stringify(authTokens));
    if(!authTokens || authTokens.refreshToken === undefined){
      console.log(`authTokens: ${authTokens}`)
      return;
    }
    const revokeResponse = await revokeAsync(
      {
        clientId: clientId,
        token: authTokens.refreshToken,
      },
      discoveryDocument
    );
    if (revokeResponse) {
      setAuthTokens(null);
    }
    else{
      console.log(revokeResponse)
    }
  };
  console.log('authTokens: ' + JSON.stringify(authTokens));
  return user ? (
    <>
    <View>
      <View>
        <Text>{user.username}</Text>
      </View>
      <Button title="Logout" onPress={() => logout()} />
    
    </View>
    </>
  ) : (
    <View>
      <Button disabled={!request} title="Login" onPress={() => promptAsync()} />

    </View>
  );
}
