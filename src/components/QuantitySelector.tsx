import { Minus, Plus } from 'lucide-react'
import { cn } from '../lib/cn'

export function QuantitySelector({
  value,
  max,
  onChange,
  tone = 'light',
}: {
  value: number
  max: number
  onChange: (quantity: number) => void
  tone?: 'light' | 'dark'
}) {
  const isDark = tone === 'dark'

  return (
    <div className={cn('inline-grid grid-cols-[40px_48px_40px] border', isDark ? 'border-white/30 text-white' : 'border-black')}>
      <button
        aria-label="Decrease quantity"
        className={cn(
          'flex h-10 items-center justify-center border-r transition disabled:opacity-35',
          isDark ? 'border-white/30 hover:bg-white hover:text-black' : 'border-black hover:bg-black hover:text-white',
        )}
        disabled={value <= 0}
        onClick={() => onChange(Math.max(0, value - 1))}
        type="button"
      >
        <Minus size={16} />
      </button>
      <span className="flex h-10 items-center justify-center text-sm font-semibold">{value}</span>
      <button
        aria-label="Increase quantity"
        className={cn(
          'flex h-10 items-center justify-center border-l transition disabled:opacity-35',
          isDark ? 'border-white/30 hover:bg-white hover:text-black' : 'border-black hover:bg-black hover:text-white',
        )}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        type="button"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}
