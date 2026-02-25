'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X, ShoppingCart, Star } from 'lucide-react'
import { productsApi, cartApi } from '@/lib/api'
import { Product, ProductListResponse } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'

const CATEGORIES = ['Tous', 'Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home', 'Beauty']

export default function ProductsPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState<ProductListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tous')
  const [page, setPage] = useState(1)
  const [addingId, setAddingId] = useState<number | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: 12 }
      if (search) params.search = search
      if (category !== 'Tous') params.category = category
      const { data: res } = await productsApi.list(params)
      setData(res)
    } catch {
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }, [page, search, category])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  const handleAddToCart = async (product: Product) => {
    if (!user) { toast.error('Connectez-vous pour ajouter au panier'); return }
    setAddingId(product.id)
    try {
      await cartApi.addItem({ product_id: product.id, quantity: 1 })
      toast.success(`${product.name} ajouté au panier`)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-2">Boutique</p>
        <h1 className="font-display text-4xl text-ink-900">Catalogue</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Rechercher un produit..."
            className="input-base pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1) }}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              category === cat
                ? 'bg-ink-900 text-white'
                : 'bg-white border border-surface-200 text-ink-600 hover:border-ink-400'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-ink-400 mb-6">
          {data.total} produit{data.total > 1 ? 's' : ''} trouvé{data.total > 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="skeleton h-52 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-8 w-full rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-ink-400 text-lg">Aucun produit trouvé</p>
          <button onClick={() => { setSearch(''); setCategory('Tous') }} className="btn-outline mt-4">
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.items.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              isAdding={addingId === product.id}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline px-4 py-2 text-sm disabled:opacity-30"
          >
            Précédent
          </button>
          <span className="text-sm text-ink-500">
            Page {page} sur {data.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="btn-outline px-4 py-2 text-sm disabled:opacity-30"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  )
}

function ProductCard({
  product, onAddToCart, isAdding, index,
}: {
  product: Product
  onAddToCart: (p: Product) => void
  isAdding: boolean
  index: number
}) {
  const isOutOfStock = product.stock === 0

  return (
    <div
      className="card group hover:shadow-md transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
    >
      {/* Image */}
      <div className="relative h-52 bg-surface-100 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl text-ink-200">📦</div>
          </div>
        )}
        {product.category && (
          <span className="absolute top-3 left-3 badge-gray text-xs">{product.category}</span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="badge-gray font-semibold">Rupture de stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-ink-900 text-sm leading-snug line-clamp-2 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-ink-400 line-clamp-2 mb-3">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink-900">{formatPrice(product.price)}</span>
          <span className="text-xs text-ink-400">{product.stock} en stock</span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={isAdding || isOutOfStock}
          className={cn(
            'w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            isOutOfStock
              ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
              : 'bg-ink-900 text-white hover:bg-ink-700 active:scale-[0.98]'
          )}
        >
          {isAdding ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Ajouter au panier
            </>
          )}
        </button>
      </div>
    </div>
  )
}