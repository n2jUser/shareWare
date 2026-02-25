'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ordersApi } from '@/lib/api'
import { CheckoutResponse } from '@/types'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Cookies from 'js-cookie'

function CheckoutForm({ clientSecret, amount }: { clientSecret: string; amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/shop/orders`,
        },
      })

      if (error) {
        toast.error(error.message || 'Erreur de paiement')
      }
    } catch (err) {
      toast.error('Erreur lors du paiement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6">
        <h2 className="font-display text-xl text-ink-900 mb-4">Informations de paiement</h2>
        <PaymentElement />
      </div>

      <div className="flex items-center justify-between">
        <Link href="/shop/cart" className="btn-outline">
          <ArrowLeft className="w-4 h-4" />
          Retour au panier
        </Link>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Traitement...
            </>
          ) : (
            `Payer ${(amount / 100).toFixed(2)} €`
          )}
        </button>
      </div>
    </form>
  )
}

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ✅ Garder SEULEMENT ce useEffect (avec vérification token)
  useEffect(() => {
    // Vérifier que l'utilisateur est authentifié
    const token = Cookies.get('access_token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    ordersApi.checkout()
      .then(({ data }) => setCheckoutData(data))
      .catch((err) => {
        toast.error(err.response?.data?.detail || 'Erreur lors du checkout')
        router.push('/shop/cart')
      })
      .finally(() => setLoading(false))
  }, [router])

  // ❌ SUPPRIMER ce deuxième useEffect (doublon)

  if (loading || !checkoutData) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-surface pt-24 px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-ink-900" />
        </div>
      </>
    )
  }

  const stripePromise = loadStripe(checkoutData.publishable_key)
  const options = {
    clientSecret: checkoutData.client_secret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0A0A0A',
        colorBackground: '#ffffff',
        colorText: '#0A0A0A',
        colorDanger: '#df1b41',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl text-ink-900 mb-2">Finaliser la commande</h1>
            <p className="text-ink-500">Commande #{checkoutData.order_id}</p>
          </div>

          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
              clientSecret={checkoutData.client_secret}
              amount={checkoutData.amount}
            />
          </Elements>
        </div>
      </main>
    </>
  )
}