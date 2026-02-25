'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ordersApi } from '@/lib/api'
import { Order } from '@/types'
import Navbar from '@/components/layout/Navbar'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const paymentStatus = searchParams.get('redirect_status')

  useEffect(() => {
    ordersApi.myOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error banner */}
          {paymentStatus === 'succeeded' && (
            <div className="card p-6 mb-8 border-2 border-green-500 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="font-semibold text-green-900">Paiement réussi !</h2>
                  <p className="text-sm text-green-700 mt-0.5">Votre commande a été confirmée</p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="card p-6 mb-8 border-2 border-red-500 bg-red-50">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h2 className="font-semibold text-red-900">Paiement échoué</h2>
                  <p className="text-sm text-red-700 mt-0.5">Veuillez réessayer</p>
                </div>
              </div>
            </div>
          )}

          <h1 className="font-display text-3xl text-ink-900 mb-8">Mes commandes</h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-ink-900" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 card">
              <p className="text-ink-400 mb-4">Aucune commande</p>
              <Link href="/shop/products" className="btn-primary">
                Découvrir nos produits
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-ink-400">Commande #{order.id}</p>
                      <p className="text-xs text-ink-300 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ink-900">{formatPrice(order.total_price)}</p>
                      <span className={`badge ${
                        order.status === 'paid' ? 'badge-green' :
                        order.status === 'pending' ? 'badge-yellow' :
                        order.status === 'cancelled' ? 'badge-red' : 'badge-blue'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  {order.items.length > 0 && (
                    <div className="space-y-2 border-t border-surface-100 pt-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-ink-600">Produit #{item.product_id} × {item.quantity}</span>
                          <span className="font-medium text-ink-900">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}