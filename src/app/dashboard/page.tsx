import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createForm, deleteForm, duplicateForm } from '@/app/actions/forms'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Edit, BarChart2, Copy, Trash2, Globe, Lock } from 'lucide-react'
import type { Form } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: forms } = await supabase
    .from('forms')
    .select(`
      *,
      submissions(count)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const formsWithCounts = forms?.map(f => ({
    ...f,
    responseCount: (f.submissions as unknown as { count: number }[])?.[0]?.count ?? 0,
  })) ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Your Forms</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{formsWithCounts.length} forms</p>
        </div>
        <form action={createForm}>
          <input type="hidden" name="title" value="Untitled form" />
          <Button type="submit" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            New form
          </Button>
        </form>
      </div>

      {formsWithCounts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl bg-white">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mx-auto mb-3">
            <Plus className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-900">Create your first form</p>
          <p className="text-sm text-zinc-500 mt-1">
            Build conversational forms with unlimited responses
          </p>
          <form action={createForm} className="mt-4">
            <input type="hidden" name="title" value="Untitled form" />
            <Button type="submit" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New form
            </Button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formsWithCounts.map((form) => (
            <FormCard key={form.id} form={form as unknown as Form} responseCount={form.responseCount} />
          ))}
        </div>
      )}
    </div>
  )
}

function FormCard({ form, responseCount }: { form: Form; responseCount: number }) {
  const updatedAt = new Date(form.updated_at)
  const timeAgo = getTimeAgo(updatedAt)

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-sm transition-shadow group">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/dashboard/${form.id}/edit`} className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-zinc-900 truncate group-hover:text-black">
            {form.title}
          </h3>
          {form.description && (
            <p className="text-xs text-zinc-400 truncate mt-0.5">{form.description}</p>
          )}
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>
              <Link href={`/dashboard/${form.id}/edit`} className="flex items-center gap-2 w-full">
                <Edit className="w-3.5 h-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/dashboard/${form.id}/responses`} className="flex items-center gap-2 w-full">
                <BarChart2 className="w-3.5 h-3.5" /> Responses
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={duplicateForm.bind(null, form.id)}>
              <DropdownMenuItem>
                <button type="submit" className="w-full flex items-center gap-2 cursor-pointer">
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
              </DropdownMenuItem>
            </form>
            <DropdownMenuSeparator />
            <form action={deleteForm.bind(null, form.id)}>
              <DropdownMenuItem variant="destructive">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 cursor-pointer"
                  onClick={(e) => {
                    if (!confirm('Delete this form? All responses will be lost.')) {
                      e.preventDefault()
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-zinc-50">
        <Badge
          variant={form.is_published ? 'default' : 'secondary'}
          className="text-xs h-5 px-1.5 gap-1"
        >
          {form.is_published ? (
            <><Globe className="w-2.5 h-2.5" /> Published</>
          ) : (
            <><Lock className="w-2.5 h-2.5" /> Draft</>
          )}
        </Badge>
        <span className="text-xs text-zinc-400 ml-auto">
          {responseCount} response{responseCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-zinc-400">·</span>
        <span className="text-xs text-zinc-400">{timeAgo}</span>
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
