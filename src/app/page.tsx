import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Zap, Shield, Code, Globe } from 'lucide-react'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: Zap,
    title: 'Conversational UI',
    description:
      'One question at a time, full-screen. The same smooth experience as Typeform — without the $59/month bill.',
  },
  {
    icon: Shield,
    title: 'Zero response limits',
    description:
      "Self-host it and collect unlimited responses forever. No per-seat pricing, no overage fees.",
  },
  {
    icon: Code,
    title: 'Conditional logic',
    description:
      "Branch questions based on answers. Skip irrelevant questions. Typeform charges for this — we don't.",
  },
  {
    icon: Globe,
    title: 'Embed anywhere',
    description:
      'iframe or popup. Drop it into any website in 30 seconds. CSV/JSON export included.',
  },
]

const COMPARISON = [
  { feature: 'Unlimited responses', formBuilder: true, typeform: false },
  { feature: 'Conversational UI', formBuilder: true, typeform: true },
  { feature: 'Conditional logic', formBuilder: true, typeform: false },
  { feature: 'Custom branding', formBuilder: true, typeform: false },
  { feature: 'CSV/JSON export', formBuilder: true, typeform: false },
  { feature: 'Self-hostable', formBuilder: true, typeform: false },
  { feature: 'Open source', formBuilder: true, typeform: false },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white text-xs font-bold">
            F
          </div>
          <span className="font-semibold text-sm">form-builder</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/postcabinets-jp/form-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <GithubIcon className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 bg-zinc-100 rounded-full px-3 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
          Open source · MIT license
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-tight mb-6">
          Typeform, minus the{' '}
          <span className="relative inline-block">
            <span className="relative z-10">$59/month</span>
            <span
              className="absolute inset-x-0 bottom-1 h-3 bg-red-100 -z-10"
              style={{ transform: 'rotate(-1deg)' }}
            />
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Conversational forms with unlimited responses. Self-host on Vercel + Supabase
          in under 5 minutes. No per-seat pricing, no overage fees, no surprises.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button size="lg" className="px-8">
              Start building for free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fform-builder&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="px-8">
              Deploy your own ↗
            </Button>
          </a>
        </div>

        <p className="text-xs text-zinc-400 mt-4">
          No credit card required · Free forever on your own infrastructure
        </p>
      </section>

      {/* Form preview mockup */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 pb-16">
        <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-xl">
          {/* Browser chrome */}
          <div className="bg-zinc-100 px-4 py-2.5 flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-zinc-400 font-mono">
              yoursite.com/f/customer-feedback
            </div>
          </div>
          {/* Conversational form preview */}
          <div className="bg-gradient-to-b from-zinc-50 to-white p-10 sm:p-16">
            <div className="max-w-sm mx-auto">
              <div className="text-xs text-zinc-400 font-mono mb-2">2 / 5</div>
              <h3 className="text-2xl font-semibold text-zinc-900 mb-6">
                How would you rate your overall experience?{' '}
                <span className="text-red-500">*</span>
              </h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <div
                    key={n}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-semibold ${
                      n === 4
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'border-zinc-200 text-zinc-500'
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer">
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-8 h-1 bg-zinc-100 rounded-full">
                <div className="h-full w-2/5 bg-zinc-900 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-16 border-t border-zinc-100">
        <h2 className="text-2xl font-bold text-zinc-900 mb-10 text-center">
          Everything Typeform has. Plus what it doesn&apos;t.
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-zinc-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-2xl mx-auto px-6 sm:px-10 py-16 border-t border-zinc-100">
        <h2 className="text-2xl font-bold text-zinc-900 mb-8 text-center">
          Side-by-side
        </h2>
        <div className="rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Feature</th>
                <th className="text-center px-4 py-3 font-semibold text-zinc-900">
                  form-builder
                </th>
                <th className="text-center px-4 py-3 text-zinc-400 font-medium">
                  Typeform Basic ($29)
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(({ feature, formBuilder, typeform }, i) => (
                <tr
                  key={feature}
                  className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}
                >
                  <td className="px-4 py-3 text-zinc-700">{feature}</td>
                  <td className="text-center px-4 py-3">
                    {formBuilder ? (
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="text-center px-4 py-3">
                    {typeform ? (
                      <Check className="w-4 h-4 text-zinc-400 mx-auto" />
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deploy CTA */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 py-16 border-t border-zinc-100">
        <div className="bg-zinc-900 rounded-2xl p-8 sm:p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Deploy in 5 minutes</h2>
          <p className="text-zinc-400 text-sm mb-8 max-w-sm mx-auto">
            One click to Vercel. Connect Supabase. Start collecting unlimited responses.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fform-builder&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-zinc-900 font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 76 65" fill="currentColor">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              Deploy with Vercel
            </a>
            <a
              href="https://github.com/postcabinets-jp/form-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 font-medium text-sm px-6 py-2.5 rounded-lg hover:border-zinc-500 hover:text-white transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              View source
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-6 sm:px-10 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-[10px] font-bold">
              F
            </div>
            form-builder — MIT License
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a
              href="https://github.com/postcabinets-jp/form-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-700 transition-colors"
            >
              GitHub
            </a>
            <Link href="/login" className="hover:text-zinc-700 transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-zinc-700 transition-colors">
              Sign up
            </Link>
            <a
              href="https://postcabinets.co.jp"
              className="hover:text-zinc-700 transition-colors"
            >
              POST CABINETS
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
