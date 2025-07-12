"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getStoredAuth, storeAuth, clearAuth } from "../utils/storage"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  const loadStoredAuth = async () => {
    try {
      const storedAuth = await getStoredAuth()
      if (storedAuth) {
        setUser(storedAuth)
      }
    } catch (error) {
      console.error("Error loading stored auth:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    // Simulate authentication - in real app, validate against stored users
    const userData = {
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
    }

    await storeAuth(userData)
    setUser(userData)
  }

  const signUp = async (name: string, email: string, password: string) => {
    // Simulate user creation
    const userData = {
      id: Date.now().toString(),
      name,
      email,
    }

    await storeAuth(userData)
    setUser(userData)
  }

  const signOut = async () => {
    await clearAuth()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
