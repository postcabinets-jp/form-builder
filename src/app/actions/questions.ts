'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { QuestionType, QuestionOption, QuestionLogic } from '@/types/database'
import {
  addQuestionSchema,
  updateQuestionSchema,
  deleteQuestionSchema,
  reorderQuestionsSchema,
  validate,
} from '@/lib/validations'

export async function addQuestion(
  formId: string,
  type: QuestionType,
  sortOrder: number
) {
  const parsed = validate(addQuestionSchema, { formId, type, sortOrder })
  if (!parsed.success) throw new Error(parsed.error)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const validatedType = parsed.data.type

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
      form_id: parsed.data.formId,
      type: validatedType,
      title: defaultTitles[validatedType],
      options: (defaultOptions[validatedType] ?? []) as unknown as import('@/types/database').Json,
      sort_order: parsed.data.sortOrder,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${parsed.data.formId}/edit`)
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
  const parsed = validate(updateQuestionSchema, { questionId, formId, updates })
  if (!parsed.success) throw new Error(parsed.error)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('questions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(parsed.data.updates as any)
    .eq('id', parsed.data.questionId)
    .eq('form_id', parsed.data.formId)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${parsed.data.formId}/edit`)
}

export async function deleteQuestion(questionId: string, formId: string) {
  const parsed = validate(deleteQuestionSchema, { questionId, formId })
  if (!parsed.success) throw new Error(parsed.error)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', parsed.data.questionId)
    .eq('form_id', parsed.data.formId)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${parsed.data.formId}/edit`)
}

export async function reorderQuestions(
  formId: string,
  orderedIds: string[]
) {
  const parsed = validate(reorderQuestionsSchema, { formId, orderedIds })
  if (!parsed.success) throw new Error(parsed.error)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Update sort_order for each question
  const updates = parsed.data.orderedIds.map((id, index) =>
    supabase
      .from('questions')
      .update({ sort_order: index })
      .eq('id', id)
      .eq('form_id', parsed.data.formId)
  )

  await Promise.all(updates)
  revalidatePath(`/dashboard/${parsed.data.formId}/edit`)
}
