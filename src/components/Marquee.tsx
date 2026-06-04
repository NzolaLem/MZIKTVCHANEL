import { Sparkles } from 'lucide-react'

const messages = ['Limited seats available', 'MzikTV live in Maputo', 'Early access tickets now open']

export function Marquee() {
  return (
    <div className="overflow-hidden bg-black py-3 text-white" aria-label="Event announcements">
      <div className="marquee-track flex w-max items-center gap-12 text-sm font-medium">
        {[...messages, ...messages, ...messages, ...messages].map((message, index) => (
          <span className="flex items-center gap-12" key={`${message}-${index}`}>
            <span>{message}</span>
            <Sparkles aria-hidden size={16} />
          </span>
        ))}
      </div>
    </div>
  )
}
