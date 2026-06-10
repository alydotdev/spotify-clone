import axios from "axios";
export const axiosInstance = axios.create({
    baseURL: "https://spotify-clone.duckdns.org/api",
    withCredentials: true,
})