'use client'

import { useEffect, useState } from 'react'
import { ClientsClient } from './clients-client'

interface Props {
  clients: any[]
  subscriptionPlan: string
}

export function ClientsRoot({ clients, subscriptionPlan }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null
  return <ClientsClient clients={clients} subscriptionPlan={subscriptionPlan} />
}

