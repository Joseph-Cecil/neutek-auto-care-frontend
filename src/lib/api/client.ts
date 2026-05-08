import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL:         API_URL,
  timeout:         30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require('@/stores/auth.store') as typeof import('@/stores/auth.store');
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((p) => {
    if (error)      p.reject(error);
    else if (token) p.resolve(token);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const orig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          orig.headers.Authorization = `Bearer ${token}`;
          return apiClient(orig);
        });
      }

      orig._retry  = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken: string = data.data.accessToken;

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/stores/auth.store') as typeof import('@/stores/auth.store');
        useAuthStore.getState().setAccessToken(newToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        orig.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return apiClient(orig);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/stores/auth.store') as typeof import('@/stores/auth.store');
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;