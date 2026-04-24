// src/auth/AuthContext.tsx

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import api from "../api/axios"
import { authStore } from "./authStore.ts"
import { getCurrentUser } from "@/api/user"
import type { ResponseUserDto } from "@/DTOs/User/UserDto"

type AuthContextType = {
  accessToken: string | null
  user: ResponseUserDto | null
  isAuthenticated: boolean
  setAccessToken: (token: string | null) => void
  refreshCurrentUser: () => Promise<ResponseUserDto | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<ResponseUserDto | null>(null)

  const setAccessToken = (token: string | null) => {
    authStore.setAccessToken(token)
    setAccessTokenState(token)
  }

  const refreshCurrentUser = useCallback(async () => {
    if (!accessToken) {
      setUser(null)
      return null
    }

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    }
  }, [accessToken])

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await api.post("/auth/refresh")
        setAccessToken(res.data.accessToken)
      } catch {
        setAccessToken(null)
      }
    }

    refresh()
  }, [])

  useEffect(() => {
    let isCancelled = false

    const loadUser = async () => {
      if (!accessToken) {
        if (!isCancelled) {
          setUser(null)
        }
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (!isCancelled) {
          setUser(currentUser)
        }
      } catch {
        if (!isCancelled) {
          setUser(null)
        }
      }
    }

    void loadUser()

    return () => {
      isCancelled = true
    }
  }, [accessToken])

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated: !!accessToken,
        setAccessToken,
        refreshCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
