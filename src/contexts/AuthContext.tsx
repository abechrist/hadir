'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { onAuthChange, loginUser as fbLogin, logoutUser } from '@/lib/services/auth-service'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((fbUser) => {
      setUser(fbUser)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const fbUser = await fbLogin(email, password)
      if (fbUser) {
        setUser(fbUser)
        return true
      }
      return false
    } catch (err: any) {
      console.error('Login error:', err)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    await logoutUser()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
