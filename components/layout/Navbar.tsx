'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingBag, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { authApi, cartApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (user && (user.role === 'buyer' || user.role === 'admin')) {
      cartApi.get().then(({ data }) => setCartCount(data.item_count || 0)).catch(() => {})
    }
  }, [user])

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    logout()
    toast.success('À bientôt !')
    router.push('/')
    setUserMenuOpen(false)
  }

  const isShopHidden = pathname.startsWith('/auth') ||
    pathname.startsWith('/dashboard')

  if (isShopHidden) return null

  const navLinks = [
    { href: '/shop/products', label: 'Catalogue' },
    { href: '/shop/cart', label: 'Panier' },
  ]

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-surface/95 backdrop-blur-md border-b border-surface-200' : 'bg-surface'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
            <Package className="w-4 h-4 text-white group-hover:text-ink-900 transition-colors duration-300" />
          </div>
          <span className="font-display text-xl text-ink-900">ShopWave</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                pathname === link.href
                  ? 'text-ink-900 bg-ink-100'
                  : 'text-ink-500 hover:text-ink-900 hover:bg-ink-50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user && (
            <Link href="/shop/cart" className="relative p-2 rounded-lg hover:bg-ink-100 transition-colors">
              <ShoppingBag className="w-5 h-5 text-ink-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-ink-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-ink-100 transition-colors"
              >
                <div className="w-7 h-7 bg-ink-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-ink-700">{user.first_name}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-surface-200 shadow-lg overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-surface-100">
                      <p className="text-sm font-medium text-ink-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-ink-400 mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      {(user.role === 'admin' || user.role === 'seller') && (
                        <Link
                          href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/seller'}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="btn-ghost text-sm">Connexion</Link>
              <Link href="/auth/signup" className="btn-primary text-sm">S'inscrire</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-ink-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-200 bg-surface/95 backdrop-blur-md">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  pathname === link.href
                    ? 'text-ink-900 bg-ink-100'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}