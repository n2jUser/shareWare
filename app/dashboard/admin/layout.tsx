'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, ShoppingBag, Package,
  LogOut, Package2, ChevronRight, Bell,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/dashboard/admin', label: 'Vue d\'ensemble', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/products', label: 'Produits', icon: Package },
  { href: '/dashboard/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/dashboard/admin/orders', label: 'Commandes', icon: ShoppingBag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
    }
  }, [user, isLoading]) // eslint-disable-line

  if (isLoading || !user) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    toast.success('À bientôt !')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-900 flex flex-col flex-shrink-0 fixed left-0 top-0 h-full z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-ink-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Package2 className="w-4 h-4 text-ink-900" />
            </div>
            <span className="font-display text-lg text-white">ShopWave</span>
          </Link>
          <div className="mt-3">
            <span className="badge bg-accent/20 text-accent text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-accent text-ink-900'
                    : 'text-ink-400 hover:text-white hover:bg-ink-800'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-ink-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-ink-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-white">
                {user.first_name[0]}{user.last_name[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-ink-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-ink-500 hover:text-red-400 hover:bg-ink-800 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-surface border-b border-surface-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="text-sm font-medium text-ink-500">
            {navItems.find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href))?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-ink-100 transition-colors">
              <Bell className="w-4 h-4 text-ink-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </button>
            <Link href="/shop/products" className="btn-ghost text-xs">
              Voir la boutique
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}