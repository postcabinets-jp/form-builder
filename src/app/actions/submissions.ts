'use server'

import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

export async function submitForm(
  formId: string,
  answers: Record<string, Json>,
  metadata: { userAgent?: string; referrer?: string } = {}
) {
  const supabase = await createClient()

  // Create submission
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .insert({
      form_id: formId,
      metadata,
      is_complete: false,
    })
    .select()
    .single()

  if (subError || !submission) {
    return { error: subError?.message ?? 'Failed to create submission' }
  }

  // Insert answers
  const answerInserts = Object.entries(answers).map(([questionId, value]) => ({
    submission_id: submission.id,
    question_id: questionId,
    value,
  }))

  if (answerInserts.length > 0) {
    const { error: answerError } = await supabase.from('answers').insert(answerInserts)
    if (answerError) {
      return { error: answerError.message }
    }
  }

  // Mark as complete
  const { error: completeError } = await supabase
    .from('submissions')
    .update({ is_complete: true, completed_at: new Date().toISOString() })
    .eq('id', submission.id)

  if (completeError) {
    return { error: completeError.message }
  }

  return { success: true, submissionId: submission.id }
}

export async function exportSubmissions(formId: string, format: 'csv' | 'json') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify form ownership
  const { data: form } = await supabase
    .from('forms')
    .select('id, title')
    .eq('id', formId)
    .eq('user_id', user.id)
    .single()

  if (!form) return { error: 'Form not found' }

  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      id,
      started_at,
      completed_at,
      is_complete,
      metadata,
      answers (
        value,
        created_at,
        questions (
          id,
          title,
          type
        )
      )
    `)
    .eq('form_id', formId)
    .eq('is_complete', true)
    .order('completed_at', { ascending: false })

  if (!submissions) return { error: 'No submissions found' }

  if (format === 'json') {
    return { data: submissions, filename: `${form.title}-responses.json` }
  }

  // CSV format
  type AnswerRow = {
    value: Json
    created_at: string
    questions: { id: string; title: string; type: string } | null
  }

  type SubmissionWithAnswers = {
    id: string
    started_at: string
    completed_at: string | null
    is_complete: boolean
    metadata: Json
    answers: AnswerRow[]
  }

  const typedSubmissions = submissions as unknown as SubmissionWithAnswers[]

  // Collect all question titles
  const questionMap = new Map<string, string>()
  typedSubmissions.forEach(sub => {
    (sub.answers as AnswerRow[]).forEach(a => {
      if (a.questions) {
        questionMap.set(a.questions.id, a.questions.title)
      }
    })
  })

  const headers = ['Submission ID', 'Submitted At', ...Array.from(questionMap.values())]
  const rows = typedSubmissions.map(sub => {
    const answerByQuestion = new Map<string, Json>()
    ;(sub.answers as AnswerRow[]).forEach(a => {
      if (a.questions) {
        answerByQuestion.set(a.questions.id, a.value)
      }
    })

    return [
      sub.id,
      sub.completed_at ?? '',
      ...Array.from(questionMap.keys()).map(qId => {
        const val = answerByQuestion.get(qId)
        if (val === undefined) return ''
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`
        return String(val)
      }),
    ]
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  return { data: csv, filename: `${form.title}-responses.csv` }
}
