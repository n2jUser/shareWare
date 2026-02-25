'use client'
import { useState, useEffect } from 'react'
import { Package, TrendingUp, Eye, ArrowUpRight, Plus } from 'lucide-react'
import { productsApi } from '@/lib/api'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const mockSalesData = [
  { month: 'Sep', ventes: 8 },
  { month: 'Oct', ventes: 14 },
  { month: 'Nov', ventes: 11 },
  { month: 'Déc', ventes: 22 },
  { month: 'Jan', ventes: 18 },
  { month: 'Fév', ventes: 25 },
]

export default function SellerDashboardPage() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.myProducts({ page: 1, page_size: 5 })
      .then(({ data }) => setProducts(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalStock = products.reduce((a, p) => a + p.stock, 0)
  const activeProducts = products.filter(p => p.is_active).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="section-label mb-2">Espace vendeur</p>
        <h1 className="font-display text-3xl text-ink-900">
          Bonjour, {user?.first_name} 👋
        </h1>
        <p className="text-sm text-ink-400 mt-1">Voici un résumé de votre activité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Produits actifs', value: activeProducts.toString(), icon: Package, color: 'bg-blue-50 text-blue-600' },
          { label: 'Stock total', value: totalStock.toString(), icon: Eye, color: 'bg-green-50 text-green-600' },
          { label: 'Revenus du mois', value: formatPrice(3240), icon: TrendingUp, color: 'bg-accent/20 text-ink-700' },
        ].map(stat => (
          <div key={stat.label} className="card p-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="font-display text-3xl text-ink-900 mb-1">{loading ? '—' : stat.value}</p>
            <p className="text-sm text-ink-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick add */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-ink-900">Ventes mensuelles</h2>
              <p className="text-sm text-ink-400 mt-0.5">Nombre de commandes</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <ArrowUpRight className="w-3 h-3" />
              +39% vs mois dernier
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockSalesData} barSize={28}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#0A0A0A', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                formatter={(val: any) => [`${val} commandes`, '']}
              />
              <Bar dataKey="ventes" fill="#C8FF00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/seller/products" className="flex items-center gap-3 p-4 rounded-xl bg-ink-900 text-white group hover:bg-ink-800 transition-colors">
              <Plus className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Nouveau produit</p>
                <p className="text-xs text-ink-400">Ajouter à la boutique</p>
              </div>
            </Link>
            <Link href="/dashboard/seller/products" className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 hover:border-ink-400 transition-colors group">
              <Package className="w-5 h-5 text-ink-500" />
              <div>
                <p className="text-sm font-medium text-ink-900">Mes produits</p>
                <p className="text-xs text-ink-400">{products.length} produit{products.length > 1 ? 's' : ''}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent products */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Mes derniers produits</h2>
          <Link href="/dashboard/seller/products" className="text-sm text-ink-500 hover:text-ink-900">
            Voir tout →
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-400 mb-4">Vous n'avez pas encore de produits</p>
            <Link href="/dashboard/seller/products" className="btn-primary text-sm">
              <Plus className="w-4 h-4" />
              Créer mon premier produit
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {products.slice(0, 5).map(product => (
              <div key={product.id} className="px-6 py-4 flex items-center gap-4 hover:bg-surface-50 transition-colors">
                <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{product.name}</p>
                  <p className="text-xs text-ink-400">{product.category || 'Sans catégorie'} · {product.stock} en stock</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-ink-900">{formatPrice(product.price)}</p>
                  <span className={`badge text-xs ${product.is_active ? 'badge-green' : 'badge-gray'}`}>
                    {product.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}