import { create } from 'zustand'
import Cookies from 'js-cookie'
import { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (v: boolean) => void
  login: (accessToken: string, refreshToken: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  login: (accessToken, refreshToken, user) => {
    Cookies.set('access_token', accessToken, { expires: 1 })
    Cookies.set('refresh_token', refreshToken, { expires: 7 })
    set({ user })
  },
  logout: () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    set({ user: null })
  },
}))