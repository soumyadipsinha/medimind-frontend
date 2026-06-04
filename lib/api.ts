import useAuthStore from "@/contexts/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 👇 Extract backend error message
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    const normalizedError = new Error(message);

    return Promise.reject(normalizedError);
  }
);

export default api;
