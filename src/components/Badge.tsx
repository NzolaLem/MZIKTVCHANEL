import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

type BadgeTone = 'dark' | 'light' | 'blue' | 'tan' | 'lavender' | 'danger'

const tones: Record<BadgeTone, string> = {
  dark: 'border-black bg-black text-white',
  light: 'border-black bg-white text-black',
  blue: 'border-mzik-blue bg-mzik-blue text-white',
  tan: 'border-mzik-tan bg-mzik-tan text-black',
  lavender: 'border-black bg-mzik-lavender text-black',
  danger: 'border-mzik-red bg-mzik-red text-white',
}

export function Badge({
  children,
  tone = 'light',
  className,
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-normal',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
