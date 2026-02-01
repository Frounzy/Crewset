'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItemProps {
  question: string
  answer: string
}

export function FAQList({ items }: { items: FAQItemProps[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <FAQItem key={index} {...item} />
      ))}
    </div>
  )
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg bg-background overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left font-medium transition-colors hover:bg-muted/50"
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}
