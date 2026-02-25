'use client'
import { useState } from 'react'
import { RefreshCw, Eye, X } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { Order, OrderStatus } from '@/types'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  paid: 'Payé',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'badge-yellow',
  paid: 'badge-blue',
  shipped: 'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
}

// Mock orders for demo
const MOCK_ORDERS: Order[] = [
  { id: 1, buyer_id: 2, status: 'paid', total_price: 149.99, stripe_payment_intent_id: 'pi_xxx', items: [{id:1,product_id:1,quantity:2,price_at_time:59.99,subtotal:119.98}], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, buyer_id: 3, status: 'pending', total_price: 39.99, stripe_payment_intent_id: undefined, items: [{id:2,product_id:3,quantity:1,price_at_time:39.99,subtotal:39.99}], created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date().toISOString() },
  { id: 3, buyer_id: 4, status: 'shipped', total_price: 299.50, stripe_payment_intent_id: 'pi_yyy', items: [], created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date().toISOString() },
  { id: 4, buyer_id: 5, status: 'delivered', total_price: 89.00, stripe_payment_intent_id: 'pi_zzz', items: [], created_at: new Date(Date.now() - 432000000).toISOString(), updated_at: new Date().toISOString() },
  { id: 5, buyer_id: 2, status: 'cancelled', total_price: 12.99, stripe_payment_intent_id: undefined, items: [], created_at: new Date(Date.now() - 604800000).toISOString(), updated_at: new Date().toISOString() },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | OrderStatus>('all')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  const updateStatus = async (orderId: number, status: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      await adminApi.updateOrderStatus(orderId, status)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status } : prev)
      toast.success('Statut mis à jour')
    } catch {
      // In demo mode, just update locally
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
      toast.success('Statut mis à jour (démo)')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Gestion</p>
          <h1 className="font-display text-3xl text-ink-900">Commandes</h1>
        </div>
        <button onClick={() => setOrders(MOCK_ORDERS)} className="btn-outline">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {['all', 'pending', 'paid', 'shipped', 'delivered'].map(s => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={cn(
                'p-4 rounded-xl text-center border transition-all',
                filterStatus === s
                  ? 'bg-ink-900 border-ink-900 text-white'
                  : 'bg-white border-surface-200 hover:border-ink-400'
              )}
            >
              <p className={cn('font-display text-2xl', filterStatus === s ? 'text-white' : 'text-ink-900')}>{count}</p>
              <p className={cn('text-xs mt-0.5', filterStatus === s ? 'text-ink-400' : 'text-ink-500')}>
                {s === 'all' ? 'Toutes' : STATUS_LABELS[s as OrderStatus]}
              </p>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                {['Commande', 'Client', 'Montant', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-4 text-xs font-semibold text-ink-400 uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-mono font-medium text-ink-900">#{order.id.toString().padStart(5, '0')}</p>
                    {order.stripe_payment_intent_id && (
                      <p className="text-xs text-ink-400 truncate max-w-[120px]">{order.stripe_payment_intent_id}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-ink-600">User #{order.buyer_id}</td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-ink-900 text-sm">{formatPrice(order.total_price)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative group">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                        disabled={updatingId === order.id}
                        className={cn(
                          'appearance-none pl-2 pr-6 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer outline-none transition-all',
                          STATUS_BADGE[order.status],
                          'bg-opacity-80 hover:bg-opacity-100'
                        )}
                      >
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink-400">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 text-ink-400 hover:text-ink-900 hover:bg-ink-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-up">
            <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink-900">
                Commande #{selectedOrder.id.toString().padStart(5, '0')}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 hover:bg-surface-100 rounded-lg">
                <X className="w-5 h-5 text-ink-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-500">Statut</span>
                <span className={`badge ${STATUS_BADGE[selectedOrder.status]}`}>{STATUS_LABELS[selectedOrder.status]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-500">Montant total</span>
                <span className="font-bold text-ink-900">{formatPrice(selectedOrder.total_price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-500">Client</span>
                <span className="text-sm text-ink-900">User #{selectedOrder.buyer_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-ink-500">Date</span>
                <span className="text-sm text-ink-900">{formatDate(selectedOrder.created_at)}</span>
              </div>
              {selectedOrder.stripe_payment_intent_id && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-ink-500">Stripe ID</span>
                  <span className="text-xs font-mono text-ink-600 bg-surface-100 px-2 py-1 rounded">{selectedOrder.stripe_payment_intent_id}</span>
                </div>
              )}

              {selectedOrder.items.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-ink-900 mb-2">Articles</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm bg-surface-50 p-3 rounded-lg">
                        <span className="text-ink-600">Produit #{item.product_id} × {item.quantity}</span>
                        <span className="font-medium text-ink-900">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-ink-700 mb-1.5">Changer le statut</p>
                <select
                  value={selectedOrder.status}
                  onChange={e => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="input-base"
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}