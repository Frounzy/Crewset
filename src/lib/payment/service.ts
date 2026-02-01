import { PaymentProvider } from './types'
import { IyzicoProvider } from './providers/iyzico'
import { StripeProvider } from './providers/stripe'

// Singleton instance
let providerInstance: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
  if (!providerInstance) {
    const providerName = process.env.PAYMENT_PROVIDER || 'stripe'
    
    if (providerName === 'iyzico') {
        providerInstance = new IyzicoProvider()
    } else {
        providerInstance = new StripeProvider()
    }
  }
  return providerInstance
}
