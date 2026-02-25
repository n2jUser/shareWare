'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Package, ArrowRight } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Email requis'
    if (!form.password) e.password = 'Mot de passe requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await authApi.signin(form)
      login(data.access_token, data.refresh_token, data.user)
      toast.success(`Bienvenue, ${data.user.first_name} !`)
      if (data.user.role === 'admin') router.push('/dashboard/admin')
      else if (data.user.role === 'seller') router.push('/dashboard/seller')
      else router.push('/shop/products')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Email ou mot de passe incorrect'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-ink-900" />
          </div>
          <span className="font-display text-xl text-white">ShopWave</span>
        </Link>

        <div>
          <blockquote className="font-display text-3xl text-white leading-tight mb-6">
            "La meilleure plateforme pour découvrir des produits uniques."
          </blockquote>
          <p className="text-ink-400 text-sm">— Marie D., cliente fidèle</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {['10K+\nProduits', '500+\nVendeurs', '50K+\nClients'].map(s => (
            <div key={s} className="p-4 rounded-xl border border-ink-700">
              {s.split('\n').map((line, i) => (
                <p key={i} className={i === 0 ? 'font-display text-2xl text-white' : 'text-xs text-ink-500 mt-0.5'}>{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl text-ink-900">ShopWave</span>
          </Link>

          <div className="mb-8">
            <p className="section-label mb-3">Bienvenue</p>
            <h1 className="font-display text-3xl text-ink-900">Se connecter</h1>
            <p className="text-sm text-ink-500 mt-2">
              Pas de compte ?{' '}
              <Link href="/auth/signup" className="text-ink-900 font-medium underline underline-offset-2">
                S'inscrire
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="vous@exemple.com"
                className={`input-base ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={`input-base pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </span>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {/* <div className="mt-8 p-4 rounded-xl bg-surface-100 border border-surface-200">
            <p className="text-xs font-semibold text-ink-500 mb-2 uppercase tracking-wide">Comptes démo</p>
            <div className="space-y-1 text-xs text-ink-600 font-mono">
              <p><span className="badge-accent mr-2">Admin</span> admin@shop.com / Admin123</p>
              <p><span className="badge-blue mr-2">Buyer</span> buyer@shop.com / Buyer123</p>
              <p><span className="badge-green mr-2">Seller</span> seller@shop.com / Seller123</p>
            </div>
          </div> */}
        
        </div>
      </div>
    </div>
  )
}