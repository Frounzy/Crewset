import { PaymentProvider } from './types'
import { StripeProvider } from './providers/stripe'

// Singleton instance
let providerInstance: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
  if (!providerInstance) {
    providerInstance = new StripeProvider()
  }
  return providerInstance
}
