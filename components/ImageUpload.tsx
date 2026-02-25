'use client'
import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { productsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  productId: number
  currentImage?: string
  onSuccess: (imageUrl: string) => void
}

export default function ImageUpload({ productId, currentImage, onSuccess }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Format accepté : JPEG, PNG, WEBP')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      const { data } = await productsApi.uploadImage(productId, file)
      toast.success('Image mise à jour !')
      onSuccess(data.image_url)
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors de l\'upload')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink-700">Image du produit</label>
      
      <div className="relative">
        {preview ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-surface-200 group">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="p-2 bg-white rounded-lg hover:bg-surface-100 transition-colors"
              >
                <Upload className="w-4 h-4 text-ink-900" />
              </button>
              <button
                onClick={() => setPreview(null)}
                disabled={uploading}
                className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              'w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all',
              uploading
                ? 'border-ink-300 bg-surface-100 cursor-not-allowed'
                : 'border-surface-300 hover:border-ink-400 hover:bg-surface-50'
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-ink-400 animate-spin" />
                <span className="text-sm text-ink-500">Upload en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-ink-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-ink-700">Cliquez pour uploader</p>
                  <p className="text-xs text-ink-400 mt-1">JPEG, PNG, WEBP (max 5MB)</p>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}