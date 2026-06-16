import { ArrowUpRight } from 'lucide-react'
import { Marquee } from '../components/Marquee'

const aboutCopy = [
  'MZIK was built on the coastline of Mozambique.',
  'No spotlight.',
  'No fashion capital.',
  'No industry machine.',
  'Just raw ground and intention.',
  'It began as a statement; putting Mozambique on the map without asking permission. What started as origin evolved into mentality.',
  'MZIK is interpreted as My Zone In Kulture.',
  'Mozambique is the root.',
  'The Zone is influence. The Zone is not a place. It is presence. It is how you carry yourself. It is the space you control without needing to announce it.',
  'From Maputo to the WORLD.',
  'From the coast to the big cities.',
  'Geography changes. Positioning does not.',
  "The coastline built the mindset patient, calculated, relentless. Like an undercurrent. You don't see it immediately, but you feel its impact.",
  'MZIK does not chase culture.',
  'It moves through it. It shapes it.',
  'This brand represents composure, influence, and ownership of space. Not noise. Not hype.',
  'Movement from the edge to the center. From unnoticed to undeniable. Where you stand becomes yours.',
  'MZIK. My Zone In Kulture.',
  'MZIK COMMANDS ATTENTION.',
  'Not by volume, but by presence.',
]

const statementLines = aboutCopy.slice(1, 5)
const movementLines = aboutCopy.slice(5, 13)
const cultureLines = aboutCopy.slice(13, 17)
const closingLines = aboutCopy.slice(17)

export function AboutPage() {
  return (
    <>
      <Marquee />
      <main className="bg-black text-white">
        <section className="about-hero relative min-h-[100svh] overflow-hidden border-b border-white/12">
          <img
            alt=""
            className="about-hero-image absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-72 md:object-[70%_center]"
            src="/mzik-assets/lookbook-10.jpg"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.72)_42%,rgba(0,0,0,0.18)_78%,rgba(0,0,0,0.62)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.20)_0%,rgba(0,0,0,0.78)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-between px-4 py-12 sm:px-6 md:py-16 lg:px-10">
            <div className="about-hero-copy" style={{ animationDelay: '140ms' }}>
              <p className="text-sm font-semibold uppercase text-white/58">About us</p>
              <h1 className="mt-5 max-w-5xl text-6xl font-extrabold uppercase leading-[0.82] md:text-9xl">
                About MZIK
              </h1>
            </div>

            <div className="about-hero-copy max-w-3xl" style={{ animationDelay: '360ms' }}>
              <p className="text-3xl font-semibold uppercase leading-tight md:text-6xl">{aboutCopy[0]}</p>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="grid gap-3 md:grid-cols-4">
            {statementLines.map((line, index) => (
              <div
                className="border border-white/18 p-5 md:min-h-48 md:p-6"
                data-reveal
                key={`${index}-${line}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <p className="text-2xl font-extrabold uppercase leading-none md:text-4xl">{line}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/12 bg-white text-black">
          <div className="mx-auto grid max-w-[1400px] gap-0 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="grid grid-cols-2 gap-2 bg-black p-2 lg:min-h-[760px]">
              {['lookbook-05.jpg', 'lookbook-10.jpg', 'lookbook-01.jpg', 'lookbook-07.jpg'].map((image, index) => (
                <div
                  className="h-64 overflow-hidden md:h-80 lg:h-full"
                  data-reveal
                  key={image}
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={`/mzik-assets/${image}`}
                    style={{ transform: index === 1 || index === 2 ? 'translateY(22px)' : undefined }}
                  />
                </div>
              ))}
            </div>

            <div className="grid content-center gap-6 p-5 sm:p-6 md:p-10 lg:p-14">
              {movementLines.map((line, index) => (
                <p
                  data-reveal
                  className={
                    index === 1 || index === 2 || index === 4
                      ? 'border-l-4 border-black pl-4 text-3xl font-extrabold uppercase leading-tight md:text-5xl'
                      : 'max-w-3xl text-lg leading-8 text-black/68'
                  }
                  key={`${index}-${line}`}
                  style={{ transitionDelay: `${index * 70}ms` }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-stretch">
            <div className="grid content-between border border-white/18 p-5 md:p-8" data-reveal>
              <div className="grid gap-5">
                {cultureLines.map((line, index) => (
                  <p
                    className={
                      index < 2
                        ? 'text-5xl font-extrabold uppercase leading-[0.88] md:text-8xl'
                        : 'max-w-3xl text-base leading-7 text-white/68 md:text-lg md:leading-8'
                    }
                    key={`${index}-${line}`}
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="relative min-h-[520px] overflow-hidden" data-reveal style={{ transitionDelay: '160ms' }}>
              <img alt="" className="h-full w-full object-cover" src="/mzik-assets/lookbook-03.jpg" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.74)_100%)]" />
            </div>
          </div>
        </section>

        <section className="bg-white text-black">
          <div className="mx-auto max-w-[1400px] px-4 py-14 text-center sm:px-6 md:py-20 lg:px-10">
            {closingLines.map((line, index) => (
              <p
                data-reveal
                className={
                  index === 1
                    ? 'mx-auto mt-6 max-w-6xl text-5xl font-extrabold uppercase leading-[0.88] md:text-8xl'
                    : 'mx-auto mt-4 max-w-3xl text-lg font-semibold uppercase text-black/62'
                }
                key={`${index}-${line}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {line}
              </p>
            ))}
          </div>
        </section>

        <section className="border-t border-white/12 bg-black text-white">
          <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
            <div data-reveal>
              <p className="text-sm font-semibold uppercase text-white/55">Mzik store</p>
              <h2 className="mt-4 max-w-3xl text-5xl font-extrabold uppercase leading-[0.88] md:text-8xl">
                Check out our store
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/64">
                Shop the clothing side of MZIK and carry the same presence outside the event.
              </p>
              <a
                className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 border border-white bg-white px-5 py-3 text-sm font-semibold uppercase text-black transition hover:bg-mzik-lavender"
                href="https://mzik.store/"
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit store
                <ArrowUpRight size={16} />
              </a>
            </div>

            <a
              className="group grid grid-cols-3 gap-2"
              data-reveal
              href="https://mzik.store/"
              rel="noopener noreferrer"
              style={{ transitionDelay: '140ms' }}
              target="_blank"
            >
              {['lookbook-04.jpg', 'lookbook-06.jpg', 'lookbook-09.jpg'].map((image, index) => (
                <img
                  alt=""
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.015] md:h-[460px]"
                  key={image}
                  src={`/mzik-assets/${image}`}
                  style={{ transform: index === 1 ? 'translateY(-24px)' : undefined }}
                />
              ))}
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
