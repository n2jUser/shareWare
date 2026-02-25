'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Package, ArrowRight, Check } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Role = 'buyer' | 'seller'

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '', role: 'buyer' as Role,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    digit: /\d/.test(form.password),
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.first_name.trim()) e.first_name = 'Prénom requis'
    if (!form.last_name.trim()) e.last_name = 'Nom requis'
    if (!form.email) e.email = 'Email requis'
    if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.digit)
      e.password = 'Le mot de passe ne respecte pas les critères'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const { data } = await authApi.signup(form)
      login(data.access_token, data.refresh_token, data.user)
      toast.success('Compte créé avec succès !')
      if (data.user.role === 'seller') router.push('/dashboard/seller')
      else router.push('/shop/products')
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Une erreur est survenue'
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

        <div className="space-y-6">
          {[
            { title: 'Acheteur', desc: 'Parcourez des milliers de produits et commandez en toute sécurité', role: 'buyer' },
            { title: 'Vendeur', desc: 'Créez votre boutique et vendez vos produits à des milliers de clients', role: 'seller' },
          ].map(item => (
            <div
              key={item.role}
              className={cn(
                'p-6 rounded-2xl border transition-all duration-300 cursor-pointer',
                form.role === item.role
                  ? 'border-accent bg-accent/10'
                  : 'border-ink-700 hover:border-ink-500'
              )}
              onClick={() => setForm({ ...form, role: item.role as Role })}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">{item.title}</h3>
                {form.role === item.role && (
                  <span className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-ink-900" />
                  </span>
                )}
              </div>
              <p className="text-ink-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-ink-600 text-sm">
          Rejoignez plus de 50 000 utilisateurs actifs sur ShopWave.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl text-ink-900">ShopWave</span>
          </Link>

          <div className="mb-8">
            <p className="section-label mb-3">Nouveau compte</p>
            <h1 className="font-display text-3xl text-ink-900">Créer un compte</h1>
            <p className="text-sm text-ink-500 mt-2">
              Déjà inscrit ?{' '}
              <Link href="/auth/login" className="text-ink-900 font-medium underline underline-offset-2">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Mobile role selector */}
          <div className="flex gap-2 mb-6 lg:hidden">
            {(['buyer', 'seller'] as Role[]).map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all',
                  form.role === role
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-ink-600 border-ink-200 hover:border-ink-400'
                )}
              >
                {role === 'buyer' ? 'Acheteur' : 'Vendeur'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Prénom</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={e => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Jean"
                  className={`input-base ${errors.first_name ? 'border-red-400' : ''}`}
                />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Nom</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={e => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Dupont"
                  className={`input-base ${errors.last_name ? 'border-red-400' : ''}`}
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="vous@exemple.com"
                className={`input-base ${errors.email ? 'border-red-400' : ''}`}
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  {[
                    { key: 'length', label: '8 caractères minimum' },
                    { key: 'uppercase', label: '1 majuscule' },
                    { key: 'digit', label: '1 chiffre' },
                  ].map(check => (
                    <div key={check.key} className="flex items-center gap-1.5">
                      <div className={cn(
                        'w-3.5 h-3.5 rounded-full flex items-center justify-center',
                        passwordChecks[check.key as keyof typeof passwordChecks]
                          ? 'bg-green-500'
                          : 'bg-ink-200'
                      )}>
                        {passwordChecks[check.key as keyof typeof passwordChecks] && (
                          <Check className="w-2 h-2 text-white" />
                        )}
                      </div>
                      <span className={cn(
                        'text-xs',
                        passwordChecks[check.key as keyof typeof passwordChecks] ? 'text-green-600' : 'text-ink-400'
                      )}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
                  Création...
                </span>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}