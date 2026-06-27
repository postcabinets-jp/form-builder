import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExportButton } from '@/components/dashboard/export-button'
import { Badge } from '@/components/ui/badge'
import type { Json } from '@/types/database'

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single()

  if (!form) redirect('/dashboard')

  const { data: questions } = await supabase
    .from('questions')
    .select('id, title, type')
    .eq('form_id', formId)
    .order('sort_order')

  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id,
      started_at,
      completed_at,
      is_complete,
      answers (
        value,
        question_id
      )
    `)
    .eq('form_id', formId)
    .eq('is_complete', true)
    .order('completed_at', { ascending: false })
    .limit(100)

  const totalSubmissions = submissions?.length ?? 0

  const { count: allCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId)

  const { count: completeCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId)
    .eq('is_complete', true)

  const completionRate = allCount
    ? Math.round(((completeCount ?? 0) / allCount) * 100)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total responses" value={completeCount ?? 0} />
        <StatCard label="Completion rate" value={`${completionRate}%`} />
        <StatCard label="Partial responses" value={(allCount ?? 0) - (completeCount ?? 0)} />
      </div>

      {/* Header + export */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-900">
          {totalSubmissions} responses
          {totalSubmissions === 100 && <span className="text-zinc-400 font-normal"> (showing latest 100)</span>}
        </h2>
        <ExportButton formId={formId} />
      </div>

      {totalSubmissions === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
          <p className="text-sm text-zinc-500">No completed responses yet.</p>
          <p className="text-xs text-zinc-400 mt-1">Share your form to start collecting responses.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3 whitespace-nowrap">
                  Submitted
                </th>
                {questions?.map(q => (
                  <th
                    key={q.id}
                    className="text-left text-xs font-medium text-zinc-500 px-4 py-3 max-w-xs"
                  >
                    <span className="truncate block max-w-32">{q.title}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions?.map((sub, i) => {
                const answerMap = new Map<string, Json>(
                  (sub.answers as { value: Json; question_id: string }[]).map(a => [a.question_id, a.value])
                )
                return (
                  <tr
                    key={sub.id}
                    className={`border-b border-zinc-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}
                  >
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(sub.completed_at!).toLocaleString()}
                    </td>
                    {questions?.map(q => (
                      <td key={q.id} className="px-4 py-3 max-w-xs">
                        <span className="text-xs text-zinc-700 truncate block max-w-48">
                          {formatAnswer(answerMap.get(q.id) ?? null)}
                        </span>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900 mt-1">{value}</p>
    </div>
  )
}

function formatAnswer(value: Json): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.join(', ')
  return JSON.stringify(value)
}
