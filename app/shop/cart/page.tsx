'use client'
import { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react'
import { cartApi } from '@/lib/api'
import { Cart } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    fetchCart()
  }, [user]) // eslint-disable-line

  const fetchCart = async () => {
    try {
      const { data } = await cartApi.get()
      setCart(data)
    } catch { toast.error('Erreur chargement panier') }
    finally { setLoading(false) }
  }

  const updateQty = async (itemId: number, qty: number) => {
    setUpdatingId(itemId)
    try {
      const { data } = await cartApi.updateItem(itemId, { quantity: qty })
      setCart(data)
    } catch { toast.error('Erreur') }
    finally { setUpdatingId(null) }
  }

  const clearCart = async () => {
    if (!confirm('Vider le panier ?')) return
    try {
      await cartApi.clear()
      setCart(prev => prev ? { ...prev, items: [], total: 0, item_count: 0 } : prev)
      toast.success('Panier vidé')
    } catch { toast.error('Erreur') }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    router.push('/shop/checkout')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="skeleton h-8 w-48 rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 skeleton h-24" />
          ))}
        </div>
      </div>
    )
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="section-label mb-2">Shopping</p>
          <h1 className="font-display text-4xl text-ink-900">Mon Panier</h1>
        </div>
        <Link href="/shop/products" className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          Continuer mes achats
        </Link>
      </div>

      {isEmpty ? (
        <div className="text-center py-24 card">
          <ShoppingBag className="w-16 h-16 text-ink-200 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-ink-900 mb-2">Votre panier est vide</h2>
          <p className="text-ink-400 mb-8">Découvrez nos produits et ajoutez vos favoris</p>
          <Link href="/shop/products" className="btn-primary">
            Explorer le catalogue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4 group">
                {/* Image placeholder */}
                <div className="w-20 h-20 bg-surface-100 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">
                  📦
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ink-900 text-sm truncate mb-1">
                    Produit #{item.product_id}
                  </h3>
                  <p className="text-xs text-ink-400 mb-3">{formatPrice(item.price_at_time)} / unité</p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, Math.max(0, item.quantity - 1))}
                        disabled={updatingId === item.id}
                        className="px-3 py-1.5 hover:bg-surface-100 transition-colors text-ink-600 disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium text-ink-900 min-w-[2.5rem] text-center">
                        {updatingId === item.id ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id}
                        className="px-3 py-1.5 hover:bg-surface-100 transition-colors text-ink-600 disabled:opacity-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => updateQty(item.id, 0)}
                      className="p-1.5 text-ink-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-ink-900">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Vider le panier
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-semibold text-ink-900 mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Sous-total ({cart.item_count} article{cart.item_count > 1 ? 's' : ''})</span>
                  <span className="font-medium text-ink-900">{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Livraison</span>
                  <span className="text-green-600 font-medium">Gratuit</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between">
                  <span className="font-semibold text-ink-900">Total</span>
                  <span className="font-bold text-xl text-ink-900">{formatPrice(cart.total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn-primary w-full"
              >
                {checkingOut ? 'Redirection...' : 'Procéder au paiement'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="text-xs text-ink-400 text-center">
                  🔒 Paiement sécurisé par Stripe
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}