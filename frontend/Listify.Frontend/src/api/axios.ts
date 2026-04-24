import axios from "axios";
import { authStore } from "@/auth/authStore.ts";

const api = axios.create({
  baseURL: "https://localhost:7125/api",
  withCredentials: true
});

/* -------- REQUEST -------- */

api.interceptors.request.use((config) => {
  const token = authStore.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/* -------- RESPONSE -------- */

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true

        refreshPromise = api.post("/auth/refresh")
          .then((res) => {
            const newToken = res.data.accessToken
            authStore.setAccessToken(newToken)
            return newToken
          })
          .catch(() => {
            authStore.setAccessToken(null)
            throw error
          })
          .finally(() => {
            isRefreshing = false
          })
      }

      const newToken = await refreshPromise

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api.request(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default api;
