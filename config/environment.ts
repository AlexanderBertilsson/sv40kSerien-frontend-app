import { Platform } from 'react-native';

export interface EnvironmentConfig {
  apiUrl: string;
  clientId: string;
  userPoolUrl: string;
  environment: 'development' | 'staging' | 'production';
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
  
  // Use Android-specific URL for Android platform in development
  const apiUrl = Platform.OS === 'android' && env === 'development'
    ? process.env.EXPO_PUBLIC_API_URL_ANDROID || 'http://10.0.2.2:5109'
    : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5109';

  const config: EnvironmentConfig = {
    apiUrl,
    clientId: process.env.EXPO_PUBLIC_CLIENT_ID || '',
    userPoolUrl: process.env.EXPO_PUBLIC_USER_POOL_URL || '',
    environment: env as 'development' | 'staging' | 'production',
  };

  // Validate required environment variables
  if (!config.clientId) {
    throw new Error('EXPO_PUBLIC_CLIENT_ID is required');
  }
  if (!config.userPoolUrl) {
    throw new Error('EXPO_PUBLIC_USER_POOL_URL is required');
  }

  return config;
};

export const ENV = getEnvironmentConfig();

// Helper functions
export const isDevelopment = () => ENV.environment === 'development';
export const isStaging = () => ENV.environment === 'staging';
export const isProduction = () => ENV.environment === 'production';

// Debug logging (only in development)
if (isDevelopment()) {
  console.log('Environment Config:', ENV);
}
