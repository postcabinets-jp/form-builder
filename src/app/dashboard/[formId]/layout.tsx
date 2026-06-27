import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

interface FormLayoutProps {
  children: React.ReactNode
  params: Promise<{ formId: string }>
}

const tabs = [
  { label: 'Edit', href: (id: string) => `/dashboard/${id}/edit` },
  { label: 'Responses', href: (id: string) => `/dashboard/${id}/responses` },
  { label: 'Share', href: (id: string) => `/dashboard/${id}/share` },
  { label: 'Settings', href: (id: string) => `/dashboard/${id}/settings` },
]

export default async function FormLayout({ children, params }: FormLayoutProps) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: form } = await supabase
    .from('forms')
    .select('id, title, is_published, slug')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single()

  if (!form) redirect('/dashboard')

  return (
    <div className="flex flex-col h-full">
      {/* Form sub-navigation */}
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-400 hover:text-zinc-700 py-3 shrink-0"
          >
            ← All forms
          </Link>
          <span className="text-zinc-200 text-sm">|</span>
          <span className="text-sm font-medium text-zinc-900 truncate max-w-xs">
            {form.title}
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <FormTabNav formId={formId} currentPath="" tabs={tabs} />
            {form.is_published && (
              <Link
                href={`/f/${form.slug}`}
                target="_blank"
                className="ml-2 text-xs text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-md px-2 py-1 transition-colors"
              >
                Preview ↗
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

function FormTabNav({
  formId,
  currentPath,
  tabs,
}: {
  formId: string
  currentPath: string
  tabs: { label: string; href: (id: string) => string }[]
}) {
  return (
    <nav className="flex items-center gap-1">
      {tabs.map(({ label, href }) => (
        <TabLink key={label} href={href(formId)} label={label} />
      ))}
    </nav>
  )
}

function TabLink({ href, label }: { href: string; label: string }) {
  // This needs to be a client component for usePathname, but we inline it
  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-3 text-sm font-medium border-b-2 transition-colors',
        'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-200'
      )}
    >
      {label}
    </Link>
  )
}
