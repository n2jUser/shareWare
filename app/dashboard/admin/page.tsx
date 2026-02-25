'use client'
import { useState, useEffect } from 'react'
import { Users, Package, ShoppingBag, TrendingUp, ArrowUpRight, Activity } from 'lucide-react'
import { adminApi, productsApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { User } from '@/types'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const mockChartData = [
  { day: 'Lun', ventes: 1200 },
  { day: 'Mar', ventes: 1900 },
  { day: 'Mer', ventes: 1400 },
  { day: 'Jeu', ventes: 2200 },
  { day: 'Ven', ventes: 2800 },
  { day: 'Sam', ventes: 3200 },
  { day: 'Dim', ventes: 2100 },
]

function StatCard({ label, value, icon: Icon, trend, color }: {
  label: string; value: string; icon: any; trend?: string; color: string
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="font-display text-3xl text-ink-900 mb-1">{value}</p>
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.listUsers({ page: 1, page_size: 5 }),
      productsApi.list({ page: 1, page_size: 1 }),
    ])
      .then(([usersRes, productsRes]) => {
        setUsers(usersRes.data.slice(0, 5))
        setStats({
          users: usersRes.data.length,
          products: productsRes.data.total || 0,
          orders: 0,
          revenue: 0,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="section-label mb-2">Tableau de bord</p>
        <h1 className="font-display text-3xl text-ink-900">Vue d'ensemble</h1>
        <p className="text-sm text-ink-400 mt-1">Bienvenue dans votre espace d'administration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Utilisateurs" value={loading ? '—' : stats.users.toString()} icon={Users} trend="+12%" color="bg-blue-50 text-blue-600" />
        <StatCard label="Produits actifs" value={loading ? '—' : stats.products.toString()} icon={Package} trend="+5%" color="bg-green-50 text-green-600" />
        <StatCard label="Commandes" value="247" icon={ShoppingBag} trend="+18%" color="bg-orange-50 text-orange-600" />
        <StatCard label="Revenus (mois)" value={formatPrice(12480)} icon={TrendingUp} trend="+24%" color="bg-accent/20 text-ink-700" />
      </div>

      {/* Chart + Recent users */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-ink-900">Ventes cette semaine</h2>
              <p className="text-sm text-ink-400 mt-0.5">Revenus quotidiens en euros</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Activity className="w-3.5 h-3.5" />
              En direct
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockChartData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#0A0A0A',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 12,
                }}
                formatter={(val: any) => [formatPrice(val), 'Ventes']}
              />
              <Line
                type="monotone"
                dataKey="ventes"
                stroke="#C8FF00"
                strokeWidth={2.5}
                dot={{ fill: '#C8FF00', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#C8FF00' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Actions rapides</h2>
          <div className="space-y-2">
            {[
              { href: '/dashboard/admin/users', label: 'Gérer les utilisateurs', icon: Users },
              { href: '/dashboard/admin/products', label: 'Gérer les produits', icon: Package },
              { href: '/dashboard/admin/orders', label: 'Voir les commandes', icon: ShoppingBag },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 transition-colors group"
              >
                <div className="w-8 h-8 bg-ink-100 rounded-lg flex items-center justify-center group-hover:bg-ink-900 transition-colors">
                  <action.icon className="w-4 h-4 text-ink-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-medium text-ink-700 group-hover:text-ink-900">{action.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-300 ml-auto group-hover:text-ink-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Derniers utilisateurs</h2>
          <Link href="/dashboard/admin/users" className="text-sm text-ink-500 hover:text-ink-900 transition-colors">
            Voir tout →
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Utilisateur</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Rôle</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Créé le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-ink-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-ink-600">{u.first_name[0]}{u.last_name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink-900">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-ink-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`badge ${u.role === 'admin' ? 'badge-accent' : u.role === 'seller' ? 'badge-blue' : 'badge-gray'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={u.is_active ? 'badge-green' : 'badge-red'}>
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-ink-400">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}