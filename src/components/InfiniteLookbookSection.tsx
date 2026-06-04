import { useEffect, useRef } from 'react'

const lookbookRail = [
  'lookbook-09.jpg',
  'lookbook-01.jpg',
  'lookbook-02.jpg',
  'lookbook-04.jpg',
  'lookbook-05.jpg',
  'lookbook-06.jpg',
  'lookbook-07.jpg',
  'lookbook-08.jpg',
]

const railImages = [...lookbookRail, ...lookbookRail, ...lookbookRail]

export function InfiniteLookbookSection() {
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let lastStageWidth = 0
    let cardWidth = 320
    let cardHeight = 420
    let cardGap = 18
    let loopWidth = railImages.length * (cardWidth + cardGap)

    const measure = () => {
      const stage = stageRef.current

      if (!stage) {
        return
      }

      const stageWidth = stage.clientWidth
      const nextWidth = stageWidth < 680 ? 260 : stageWidth < 1180 ? 390 : 470
      const nextHeight = stageWidth < 680 ? 350 : stageWidth < 1180 ? 500 : 560
      const nextGap = stageWidth < 680 ? 12 : 18

      if (stageWidth !== lastStageWidth || nextWidth !== cardWidth) {
        lastStageWidth = stageWidth
        cardWidth = nextWidth
        cardHeight = nextHeight
        cardGap = nextGap
        loopWidth = railImages.length * (cardWidth + cardGap)

        stage.style.setProperty('--rail-card-width', `${cardWidth}px`)
        stage.style.setProperty('--rail-card-height', `${cardHeight}px`)
      }
    }

    const animate = (time: number) => {
      const stage = stageRef.current

      if (!stage) {
        return
      }

      measure()

      const stageWidth = stage.clientWidth
      const span = cardWidth + cardGap
      const speed = reduceMotion.matches ? 0 : 0.054
      const progress = time * speed
      const center = stageWidth / 2

      cardRefs.current.forEach((card, index) => {
        if (!card) {
          return
        }

        const rawX = (index * span + progress) % loopWidth
        const x = rawX - span * 2
        const cardCenter = x + cardWidth / 2
        const signedDistance = (cardCenter - center) / (center + cardWidth / 2)
        const edgeDistance = Math.min(1, Math.abs(signedDistance))
        const bend = Math.max(0, (edgeDistance - 0.16) / 0.84)
        const rotateY = -signedDistance * bend * 48
        const rotateZ = signedDistance * bend * 5
        const lift = bend * -54
        const scale = 1 - bend * 0.055
        const opacity = 0.52 + (1 - edgeDistance) * 0.48
        const radius = bend * 30

        card.style.opacity = `${opacity}`
        card.style.zIndex = `${Math.round((1 - edgeDistance) * 100)}`
        card.style.borderRadius = `${radius}px`
        card.style.transform = `translate3d(${x}px, ${lift}px, 0) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`
      })

      frame = window.requestAnimationFrame(animate)
    }

    const resizeObserver = new ResizeObserver(measure)

    if (stageRef.current) {
      resizeObserver.observe(stageRef.current)
    }

    frame = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <section className="overflow-hidden bg-black py-16 text-white md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 text-center sm:px-6 lg:px-10">
        <h2 className="mx-auto max-w-6xl text-5xl font-extrabold uppercase leading-[0.98] md:text-7xl lg:text-8xl">
          A live platform for <span className="text-mzik-lavender">Kulture.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-7 text-white/72">
          MzikTV brings the clothing brand into rooms where music, fashion, and people become the show.
        </p>
      </div>

      <div className="mt-12 md:mt-16">
        <div className="curved-rail-stage" ref={stageRef}>
          {railImages.map((image, index) => (
            <figure
              className="curved-rail-card"
              key={`${image}-${index}`}
              ref={(node) => {
                cardRefs.current[index] = node
              }}
            >
              <img alt="" className="h-full w-full object-cover" src={`/mzik-assets/${image}`} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
