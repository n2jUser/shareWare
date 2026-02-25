'use client'
import { useEffect } from 'react'
import Cookies from 'js-cookie'
import { useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const token = Cookies.get('access_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(({ data }) => {
        const at = Cookies.get('access_token') || ''
        const rt = Cookies.get('refresh_token') || ''
        login(at, rt, data)
      })
      .catch(() => { logout() })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line

  return <>{children}</>
}