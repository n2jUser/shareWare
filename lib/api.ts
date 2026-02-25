import axios from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = Cookies.get('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh })
          Cookies.set('access_token', data.access_token, { expires: 1 })
          Cookies.set('refresh_token', data.refresh_token, { expires: 7 })
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          Cookies.remove('access_token')
          Cookies.remove('refresh_token')
          window.location.href = '/auth/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data: { email: string; password: string; first_name: string; last_name: string; role: string }) =>
    api.post('/auth/signup', data),
  signin: (data: { email: string; password: string }) =>
    api.post('/auth/signin', data),
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
  me: () => api.get('/auth/me'),
  updateProfile: (data: { first_name?: string; last_name?: string; avatar_url?: string }) =>
    api.patch('/auth/me', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/auth/me/change-password', data),
  logout: () => api.post('/auth/logout'),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {

  uploadImage: (productId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/products/${productId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  list: (params?: { page?: number; page_size?: number; category?: string; search?: string; seller_id?: number }) =>
    api.get('/products', { params }),
  get: (id: number) => api.get(`/products/${id}`),
  create: (data: { name: string; description?: string; price: number; image_url?: string; category?: string; stock: number }) =>
    api.post('/products', data),
  update: (id: number, data: Partial<{ name: string; description: string; price: number; image_url: string; category: string; stock: number; is_active: boolean }>) =>
    api.patch(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  myProducts: (params?: { page?: number; page_size?: number }) =>
    api.get('/products/me/products', { params }),
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data: { product_id: number; quantity: number }) =>
    api.post('/cart/items', data),
  updateItem: (itemId: number, data: { quantity: number }) =>
    api.patch(`/cart/items/${itemId}`, data),
  clear: () => api.delete('/cart'),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  checkout: () => api.post('/checkout'),
  myOrders: () => api.get('/orders'),
  getOrder: (id: number) => api.get(`/orders/${id}`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  
 refundOrder: (orderId: number, data: { amount?: number; reason?: string; note?: string }) =>
    api.post(`/admin/orders/${orderId}/refund`, data),

  listUsers: (params?: { page?: number; page_size?: number }) =>
    api.get('/admin/users', { params }),
  deactivateUser: (id: number) => api.patch(`/admin/users/${id}/deactivate`),
  activateUser: (id: number) => api.patch(`/admin/users/${id}/activate`),
  updateOrderStatus: (orderId: number, status: string) =>
    api.patch(`/admin/orders/${orderId}/status`, { status }),
}