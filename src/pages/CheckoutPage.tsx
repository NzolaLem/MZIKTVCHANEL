import { Link } from 'react-router-dom'
import { CheckoutForm } from '../components/CheckoutForm'
import { Marquee } from '../components/Marquee'
import { SectionHeader } from '../components/SectionHeader'
import { useOrder } from '../context/useOrder'

export function CheckoutPage() {
  const { draftOrder } = useOrder()

  if (!draftOrder) {
    return (
      <main className="section-shell bg-white">
        <div className="mx-auto max-w-xl border border-black p-8 text-center">
          <h1 className="text-4xl font-semibold uppercase">No tickets selected</h1>
          <p className="mt-3 text-sm text-black/60">Use your invite code on the home page to unlock your ticket.</p>
          <Link className="mt-6 inline-flex border border-black bg-black px-5 py-3 text-sm font-semibold uppercase text-white" to="/">
            Return home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <Marquee />
      <main className="section-shell bg-mzik-stone">
        <SectionHeader eyebrow="Checkout" title="Confirm your details">
          Payments are mocked for this MVP. The flow simulates processing and creates a fake Mzik order ID.
        </SectionHeader>
        <section className="mx-auto max-w-4xl border border-black bg-white p-5 md:p-7">
          <CheckoutForm />
        </section>
      </main>
    </>
  )
}
