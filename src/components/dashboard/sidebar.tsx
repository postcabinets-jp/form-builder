'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Settings,
  ExternalLink,
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Forms', icon: LayoutDashboard },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-zinc-200 shrink-0">
      <div className="px-4 py-4 border-b border-zinc-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0">
            F
          </div>
          <span className="font-semibold text-zinc-900 text-sm">form-builder</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-zinc-100 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-zinc-100 text-zinc-900'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          Website
        </Link>
      </div>
    </aside>
  )
}

// Mobile sidebar menu item helpers for form pages
export function FormNavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ElementType
  label: string
}) {
  const pathname = usePathname()
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
        pathname === href
          ? 'bg-zinc-100 text-zinc-900'
          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}
