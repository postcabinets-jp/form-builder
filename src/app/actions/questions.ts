'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { QuestionType, QuestionOption, QuestionLogic } from '@/types/database'

export async function addQuestion(
  formId: string,
  type: QuestionType,
  sortOrder: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const defaultTitles: Record<QuestionType, string> = {
    text: 'Your answer',
    email: 'Email address',
    number: 'Number',
    select: 'Choose one',
    multi_select: 'Select all that apply',
    rating: 'Rate your experience',
    date: 'Date',
    file: 'Upload a file',
  }

  const defaultOptions: Partial<Record<QuestionType, QuestionOption[]>> = {
    select: [
      { id: crypto.randomUUID(), label: 'Option 1', value: 'option_1' },
      { id: crypto.randomUUID(), label: 'Option 2', value: 'option_2' },
    ],
    multi_select: [
      { id: crypto.randomUUID(), label: 'Option 1', value: 'option_1' },
      { id: crypto.randomUUID(), label: 'Option 2', value: 'option_2' },
    ],
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({
      form_id: formId,
      type,
      title: defaultTitles[type],
      options: (defaultOptions[type] ?? []) as unknown as import('@/types/database').Json,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${formId}/edit`)
  return data
}

export async function updateQuestion(
  questionId: string,
  formId: string,
  updates: {
    title?: string
    description?: string
    required?: boolean
    options?: QuestionOption[]
    logic?: QuestionLogic
    sort_order?: number
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('questions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updates as any)
    .eq('id', questionId)
    .eq('form_id', formId)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${formId}/edit`)
}

export async function deleteQuestion(questionId: string, formId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    .eq('form_id', formId)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${formId}/edit`)
}

export async function reorderQuestions(
  formId: string,
  orderedIds: string[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Update sort_order for each question
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('questions')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('form_id', formId)
  )

  await Promise.all(updates)
  revalidatePath(`/dashboard/${formId}/edit`)
}
