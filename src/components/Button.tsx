import { Link } from 'react-router-dom'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'

type ButtonVariant = 'dark' | 'light' | 'outline' | 'ghost' | 'accent'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  to?: string
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  dark: 'border-black bg-black text-white hover:bg-white hover:text-black',
  light: 'border-white bg-white text-black hover:bg-black hover:text-white',
  outline: 'border-current bg-transparent text-current hover:bg-black hover:text-white',
  ghost: 'border-transparent bg-transparent text-current hover:border-current',
  accent: 'border-black bg-mzik-lavender text-black hover:bg-black hover:text-white',
}

const baseClass =
  'inline-flex min-h-11 items-center justify-center gap-2 border px-5 py-3 text-sm font-semibold uppercase tracking-normal transition duration-200 disabled:cursor-not-allowed disabled:opacity-45'

export function Button({ children, to, variant = 'dark', className, ...props }: ButtonProps) {
  const buttonClass = cn(baseClass, variants[variant], className)

  if (to) {
    return (
      <Link className={buttonClass} to={to}>
        {children}
      </Link>
    )
  }

  return (
    <button className={buttonClass} type="button" {...props}>
      {children}
    </button>
  )
}
