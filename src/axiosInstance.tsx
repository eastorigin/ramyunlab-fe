import axios from "axios";
import store from "./Redux/store.tsx";
import { RootState } from "./Redux/store.tsx";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_SERVER,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const state: RootState = store.getState();
        const token = state.auth.token;
        console.log("Token from Redux state:", token); // 토큰 로그 확인
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;