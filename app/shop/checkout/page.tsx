'use client'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements, CardElement, useStripe, useElements,
} from '@stripe/react-stripe-js'
import { ordersApi } from '@/lib/api'
import { CheckoutResponse } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

function CheckoutForm({ checkout }: { checkout: CheckoutResponse }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [cardError, setCardError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setCardError('')

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) { setLoading(false); return }

    const { error, paymentIntent } = await stripe.confirmCardPayment(checkout.client_secret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      setCardError(error.message || 'Erreur de paiement')
      setLoading(false)
    } else if (paymentIntent?.status === 'succeeded') {
      setSucceeded(true)
      toast.success('Paiement réussi !')
      setTimeout(() => router.push('/shop/products'), 2500)
    }
  }

  if (succeeded) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-display text-2xl text-ink-900 mb-2">Commande confirmée !</h2>
        <p className="text-ink-500">Merci pour votre achat. Vous allez être redirigé...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-3">Informations de carte</label>
        <div className="p-4 border border-ink-200 rounded-xl bg-white focus-within:border-ink-900 focus-within:ring-1 focus-within:ring-ink-900 transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '15px',
                  color: '#0A0A0A',
                  fontFamily: 'DM Sans, sans-serif',
                  '::placeholder': { color: '#B4B4B4' },
                },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
        {cardError && (
          <p className="text-red-500 text-sm mt-2">{cardError}</p>
        )}
      </div>

      {/* Test card hint */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700 font-medium mb-1">Carte de test Stripe</p>
        <p className="text-xs text-blue-600 font-mono">4242 4242 4242 4242 — 12/26 — 424</p>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Traitement...
          </span>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Payer {formatPrice(checkout.amount / 100, checkout.currency.toUpperCase())}
          </>
        )}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [stripePromiseResolved, setStripePromiseResolved] = useState<any>(null)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    ordersApi.checkout()
      .then(({ data }) => {
        setCheckout(data)
        setStripePromiseResolved(loadStripe(data.publishable_key))
      })
      .catch(err => {
        toast.error(err.response?.data?.detail || 'Erreur lors du checkout')
        router.push('/shop/cart')
      })
      .finally(() => setLoading(false))
  }, [user]) // eslint-disable-line

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="skeleton h-8 w-48 rounded mb-8" />
        <div className="card p-6 space-y-4">
          <div className="skeleton h-12 w-full rounded" />
          <div className="skeleton h-12 w-full rounded" />
          <div className="skeleton h-12 w-full rounded" />
        </div>
      </div>
    )
  }

  if (!checkout) return null

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <Link href="/shop/cart" className="btn-ghost mb-8 -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Retour au panier
      </Link>

      <div className="mb-8">
        <p className="section-label mb-2">Finalisation</p>
        <h1 className="font-display text-4xl text-ink-900">Paiement</h1>
      </div>

      {/* Order summary */}
      <div className="card p-5 mb-6">
        <h2 className="font-medium text-ink-900 mb-3 text-sm">Récapitulatif commande #{checkout.order_id}</h2>
        <div className="flex justify-between items-center">
          <span className="text-ink-500 text-sm">Total à payer</span>
          <span className="font-bold text-2xl text-ink-900">
            {formatPrice(checkout.amount / 100, checkout.currency.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Stripe form */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-4 h-4 text-ink-400" />
          <span className="text-sm text-ink-500">Paiement sécurisé — crypté SSL</span>
        </div>

        <Elements stripe={stripePromiseResolved || stripePromise}>
          <CheckoutForm checkout={checkout} />
        </Elements>

        <div className="mt-6 flex items-center justify-center gap-4">
          {['Visa', 'Mastercard', 'Amex'].map(card => (
            <span key={card} className="text-xs text-ink-300 font-mono">{card}</span>
          ))}
        </div>
      </div>
    </div>
  )
}