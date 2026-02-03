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
    <div className="group rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center justify-between w-full p-5 text-left font-medium transition-colors hover:bg-white/5"
      >
        <span className="leading-relaxed">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:text-primary",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-5 pt-0 border-t border-white/10 text-muted-foreground text-sm leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}
