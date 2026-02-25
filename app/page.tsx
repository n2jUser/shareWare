import Link from 'next/link'
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        {/* Hero */}
        <section className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="section-label mb-6">Plateforme e-commerce</p>
            <h1 className="page-title mb-6">
              Discover products <br />
              <span className="italic text-ink-400">you'll love.</span>
            </h1>
            <p className="text-lg text-ink-500 mb-10 max-w-lg leading-relaxed">
              Des milliers de produits, des vendeurs vérifiés, une expérience d'achat pensée pour vous.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop/products" className="btn-primary">
                Explorer le catalogue
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/signup" className="btn-outline">
                Créer un compte
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Produits', value: '10K+' },
              { label: 'Vendeurs', value: '500+' },
              { label: 'Clients', value: '50K+' },
              { label: 'Commandes', value: '200K+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-4xl text-ink-900">{stat.value}</p>
                <p className="text-sm text-ink-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-ink-900">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Livraison express', desc: 'Recevez vos commandes en 24h partout en France' },
              { icon: Shield, title: 'Paiement sécurisé', desc: 'Transactions protégées par Stripe, vos données sont sécurisées' },
              { icon: Truck, title: 'Retours gratuits', desc: 'Satisfait ou remboursé sous 30 jours, sans conditions' },
            ].map((feature) => (
              <div key={feature.title} className="p-8 rounded-2xl border border-ink-700 group hover:border-accent transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-accent mb-5" />
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-ink-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-4xl text-ink-900 mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-ink-500 mb-8">
              Rejoignez des milliers d'acheteurs satisfaits.
            </p>
            <Link href="/auth/signup" className="btn-accent">
              S'inscrire gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}