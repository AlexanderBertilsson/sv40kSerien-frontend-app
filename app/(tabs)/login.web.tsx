import { LoginView } from '@/components/auth/LoginView';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  return <LoginView />;
}
