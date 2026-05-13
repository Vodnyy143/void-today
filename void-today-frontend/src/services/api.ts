import * as axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

let isRefreshing = false;
let failQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
    failQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(null);
        }
    });
    failQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthUrl =
            originalRequest.url?.includes('/auth/refresh') ||
            originalRequest.url?.includes('/auth/sign-in') ||
            originalRequest.url?.includes('/auth/sign-up') ||
            originalRequest.url?.includes('/auth/me');

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthUrl
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;  // ← помечаем что уже пробовали
            isRefreshing = true;

            try {
                await api.post('/auth/refresh');
                processQueue(null);
                return api(originalRequest);
            } catch (err) {
                processQueue(err);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;  // ← сбрасываем флаг
            }
        }

        return Promise.reject(error);
    }
);

export default api;