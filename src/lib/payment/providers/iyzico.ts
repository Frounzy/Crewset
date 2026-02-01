
import Iyzipay from 'iyzipay'
import { PaymentProvider, CheckoutSessionParams, CheckoutSessionResult } from '../types'

export class IyzicoProvider implements PaymentProvider {
  private iyzipay: any

  constructor() {
    this.iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    })
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSessionResult> {
    const { user, items, callbackUrl, currency } = params
    
    // Calculate total price
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0)
    
    // Iyzico requires price to be formatted as string if needed, but SDK handles numbers usually.
    // However, basket items total must match price.

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `sess_${Date.now()}_${user.id}`,
      price: totalPrice.toFixed(2),
      paidPrice: totalPrice.toFixed(2),
      currency: currency === 'TRY' ? Iyzipay.CURRENCY.TRY : Iyzipay.CURRENCY.USD,
      basketId: `basket_${Date.now()}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: callbackUrl,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: user.id,
        name: user.fullName?.split(' ')[0] || 'Guest',
        surname: user.fullName?.split(' ').slice(1).join(' ') || 'User',
        gsmNumber: '+905300000000', // Mandatory field, maybe ask user or use placeholder
        email: user.email,
        identityNumber: '11111111111', // Mandatory, sandbox allows this
        lastLoginDate: '2015-10-05 12:43:35',
        registrationDate: '2013-04-21 15:12:09',
        registrationAddress: user.address?.address || 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        ip: user.ip,
        city: user.address?.city || 'Istanbul',
        country: user.address?.country || 'Turkey',
        zipCode: user.address?.zipCode || '34732'
      },
      shippingAddress: {
        contactName: user.address?.contactName || user.fullName || 'Guest User',
        city: user.address?.city || 'Istanbul',
        country: user.address?.country || 'Turkey',
        address: user.address?.address || 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: user.address?.zipCode || '34732'
      },
      billingAddress: {
        contactName: user.address?.contactName || user.fullName || 'Guest User',
        city: user.address?.city || 'Istanbul',
        country: user.address?.country || 'Turkey',
        address: user.address?.address || 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
        zipCode: user.address?.zipCode || '34732'
      },
      basketItems: items.map(item => ({
        id: item.id,
        name: item.name,
        category1: item.category || 'General',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: item.price.toFixed(2)
      }))
    }

    return new Promise((resolve, reject) => {
      this.iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
        if (err) {
          reject(err)
        } else if (result.status !== 'success') {
          reject(new Error(result.errorMessage))
        } else {
          resolve({
            checkoutContent: result.checkoutFormContent,
            token: result.token,
            provider: 'iyzico'
          })
        }
      })
    })
  }

  async verifyPayment(token: string): Promise<{ success: boolean; paymentId?: string; raw?: any }> {
    return new Promise((resolve, reject) => {
      this.iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        token: token
      }, (err: any, result: any) => {
        if (err) {
          reject(err)
        } else if (result.status !== 'success') {
          resolve({ success: false, raw: result })
        } else {
          // Check payment status
          if (result.paymentStatus === 'SUCCESS') {
             resolve({ 
                 success: true, 
                 paymentId: result.paymentId,
                 raw: result 
             })
          } else {
              resolve({ success: false, raw: result })
          }
        }
      })
    })
  }
}
