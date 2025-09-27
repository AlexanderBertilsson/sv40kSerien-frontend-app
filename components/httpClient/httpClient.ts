// apiClient.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { ENV } from "../../config/environment";

// API base URL from environment configuration
const BASE_URL = ENV.apiUrl;

// Keys for secure storage
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Helper to read tokens
async function getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}
async function getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}
async function saveTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
}

// Axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: Platform.OS === "web" &&  ENV.environment !== "development", // only for web
});

// Flag to avoid multiple refresh calls at once
let isRefreshing = false;

let failedQueue: {
    resolve: (accessToken: string) => void;
    reject: (axiosError: any) => void;
}[] = [];

// Queue helper
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (Platform.OS !== "web") {
        const token = await getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor (handle refresh)
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log("Refreshing token...");
            // WEB FLOW (cookies)
            if (Platform.OS === "web") {
                console.log("Refreshing token in web flow...");
                try {
                    await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                    return apiClient(originalRequest);
                } catch (err) {
                    console.log("Error refreshing token in web flow...");
                    return Promise.reject(err);
                }
            }

            // MOBILE FLOW (manual token handling)
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(apiClient(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;
            try {
                const refreshToken = await getRefreshToken();
                if (!refreshToken) throw new Error("No refresh token");

                const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                const { access_token, refresh_token } = res.data;
                await saveTokens(access_token, refresh_token);

                apiClient.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${access_token}`;

                processQueue(null, access_token);
                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                throw err;
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
