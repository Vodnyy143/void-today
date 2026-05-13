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

        console.log('interceptor hit', error.response?.status, originalRequest.url);

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/sign-in') &&
            !originalRequest.url?.includes('/auth/sign-up')
        ) {
            console.log('attempting refresh...');

            if (isRefreshing) {
                console.log('already refreshing, queuing...');
                // ...
            }

            try {
                console.log('refresh success');
                await api.post('/auth/refresh');
                processQueue(null);
                return api(originalRequest);
            } catch (err) {
                console.log('refresh failed, redirecting');
                processQueue(err);
                window.location.href = '/';
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;