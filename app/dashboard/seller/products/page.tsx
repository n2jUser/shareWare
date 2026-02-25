'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, X, Package } from 'lucide-react'
import { productsApi } from '@/lib/api'
import { Product } from '@/types'
import { formatPrice, cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'

type ModalType = 'create' | 'edit' | null

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<ModalType>(null)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '',
    stock: '0', image_url: '', is_active: true,
  })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await productsApi.myProducts({ page, page_size: 12 })
      setProducts(data.items || [])
      setTotal(data.total || 0)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [page]) // eslint-disable-line

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', category: '', stock: '0', image_url: '', is_active: true })
    setEditProduct(null)
    setModal('create')
  }

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category || '',
      stock: product.stock.toString(),
      image_url: product.image_url || '',
      is_active: product.is_active,
    })
    setEditProduct(product)
    setModal('edit')
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nom requis'); return }
    if (!form.price || parseFloat(form.price) <= 0) { toast.error('Prix invalide'); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: parseFloat(form.price),
      category: form.category.trim() || undefined,
      stock: Math.max(0, parseInt(form.stock) || 0),
      image_url: form.image_url.trim() || undefined,
    }
    try {
      if (modal === 'create') {
        const { data } = await productsApi.create(payload)
        setProducts([data, ...products])
        setTotal(t => t + 1)
        toast.success('Produit créé !')
      } else if (editProduct) {
        const { data } = await productsApi.update(editProduct.id, { ...payload, is_active: form.is_active })
        setProducts(products.map(p => p.id === editProduct.id ? data : p))
        toast.success('Produit mis à jour !')
      }
      setModal(null)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Supprimer "${product.name}" définitivement ?`)) return
    setActionId(product.id)
    try {
      await productsApi.delete(product.id)
      setProducts(products.filter(p => p.id !== product.id))
      setTotal(t => t - 1)
      toast.success('Produit supprimé')
    } catch { toast.error('Erreur lors de la suppression') }
    finally { setActionId(null) }
  }

  const toggleActive = async (product: Product) => {
    setActionId(product.id)
    try {
      const { data } = await productsApi.update(product.id, { is_active: !product.is_active })
      setProducts(products.map(p => p.id === product.id ? data : p))
      toast.success(data.is_active ? 'Produit activé' : 'Produit masqué')
    } catch { toast.error('Erreur') }
    finally { setActionId(null) }
  }

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))
    : products

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Catalogue</p>
          <h1 className="font-display text-3xl text-ink-900">Mes produits</h1>
          <p className="text-sm text-ink-400 mt-0.5">{total} produit{total > 1 ? 's' : ''} au total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="input-base pl-10"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card skeleton h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 card">
          <Package className="w-12 h-12 text-ink-200 mx-auto mb-3" />
          <h3 className="font-display text-xl text-ink-900 mb-2">Aucun produit</h3>
          <p className="text-ink-400 mb-6 text-sm">{search ? 'Aucun résultat pour votre recherche' : 'Commencez par créer votre premier produit'}</p>
          {!search && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="w-4 h-4" />
              Créer un produit
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <div key={product.id} className={cn('card group transition-all duration-200 hover:shadow-sm', !product.is_active && 'opacity-60')}>
              {/* Header */}
              <div className="relative h-36 bg-surface-100 flex items-center justify-center text-4xl rounded-t-2xl overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : '📦'}
                {/* Toggle active */}
                <button
                  onClick={() => toggleActive(product)}
                  disabled={actionId === product.id}
                  className="absolute top-2 right-2 p-1 bg-white/90 rounded-lg shadow-sm hover:bg-white transition-colors"
                  title={product.is_active ? 'Masquer' : 'Activer'}
                >
                  {product.is_active
                    ? <ToggleRight className="w-5 h-5 text-green-500" />
                    : <ToggleLeft className="w-5 h-5 text-ink-400" />}
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-ink-900 line-clamp-2 flex-1">{product.name}</h3>
                  <span className="font-bold text-sm text-ink-900 flex-shrink-0">{formatPrice(product.price)}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  {product.category && <span className="badge-gray text-xs">{product.category}</span>}
                  <span className={cn('text-xs font-medium', product.stock === 0 ? 'text-red-500' : 'text-ink-400')}>
                    {product.stock === 0 ? 'Rupture' : `${product.stock} en stock`}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-ink-700 border border-surface-200 rounded-lg hover:border-ink-400 hover:bg-ink-50 transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={actionId === product.id}
                    className="p-1.5 text-ink-300 hover:text-red-500 hover:bg-red-50 rounded-lg border border-surface-200 hover:border-red-200 transition-all disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-outline px-4 py-2 text-sm disabled:opacity-30">←</button>
          <span className="text-sm text-ink-500">Page {page}</span>
          <button onClick={() => setPage(p => p+1)} disabled={products.length < 12} className="btn-outline px-4 py-2 text-sm disabled:opacity-30">→</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-up">
            <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-display text-xl text-ink-900">
                {modal === 'create' ? '✨ Nouveau produit' : '✏️ Modifier le produit'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-ink-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Nom du produit *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="input-base"
                  placeholder="Ex: Casque audio premium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="input-base resize-none"
                  rows={3}
                  placeholder="Décrivez votre produit..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Prix (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})}
                    className="input-base"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={e => setForm({...form, stock: e.target.value})}
                    className="input-base"
                    placeholder="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Catégorie</label>
                <select
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})}
                  className="input-base"
                >
                  <option value="">Sélectionner...</option>
                  {['Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home', 'Beauty', 'Autre'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">URL de l'image</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={e => setForm({...form, image_url: e.target.value})}
                  className="input-base"
                  placeholder="https://..."
                />
                {form.image_url && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-surface-200">
                    <img src={form.image_url} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

                {modal === 'edit' && editProduct && (
                  <ImageUpload
                    productId={editProduct.id}
                    currentImage={form.image_url}
                    onSuccess={(imageUrl) => setForm({...form, image_url: imageUrl})}
                  />
                )}

            </div>

            <div className="px-6 py-4 border-t border-surface-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setModal(null)} className="btn-outline" disabled={saving}>Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sauvegarde...
                  </span>
                ) : modal === 'create' ? 'Créer le produit' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}