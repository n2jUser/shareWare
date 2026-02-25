export type UserRole = 'buyer' | 'seller' | 'admin'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  role: UserRole
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  image_url?: string
  category?: string
  stock: number
  is_active: boolean
  seller_id: number
  created_at: string
  updated_at: string
}

export interface ProductListResponse {
  items: Product[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  price_at_time: number
  subtotal: number
  product?: Product
}

export interface Cart {
  id: number
  user_id: number
  items: CartItem[]
  total: number
  item_count: number
  created_at: string
  updated_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export interface OrderItem {
  id: number
  product_id?: number
  seller_id?: number
  quantity: number
  price_at_time: number
  subtotal: number
}

export interface Order {
  id: number
  buyer_id?: number
  status: OrderStatus
  total_price: number
  stripe_payment_intent_id?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface CheckoutResponse {
  order_id: number
  client_secret: string
  publishable_key: string
  amount: number
  currency: string
}

export interface ApiError {
  detail: string
}