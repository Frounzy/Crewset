
export interface PaymentUser {
  id: string
  email: string
  fullName?: string
  ip: string
  address?: {
    contactName: string
    city: string
    country: string
    address: string
    zipCode?: string
  }
}

export interface CheckoutSessionParams {
  user: PaymentUser
  items: {
    id: string
    name: string
    price: number
    currency: string
    category?: string
    priceId?: string
  }[]
  callbackUrl: string
  currency: string
}

export interface CheckoutSessionResult {
  url?: string
  provider: 'stripe'
}

export interface PaymentProvider {
  createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult>
  verifyPayment(token: string): Promise<{ success: boolean; paymentId?: string; raw?: any }>
}
