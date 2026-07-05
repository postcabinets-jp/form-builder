'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { FormSettings } from '@/types/database'
import {
  createFormSchema,
  updateFormSchema,
  deleteFormSchema,
  duplicateFormSchema,
  validate,
} from '@/lib/validations'

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

export async function createForm(formData: FormData) {
  const parsed = validate(createFormSchema, {
    title: formData.get('title'),
  })
  if (!parsed.success) throw new Error(parsed.error)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { title } = parsed.data
  const slug = generateSlug(title)
  const { data: form, error } = await supabase
    .from('forms')
    .insert({
      user_id: user.id,
      title: title.trim(),
      slug,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  redirect(`/dashboard/${form.id}/edit`)
}

export async function updateForm(
  formId: string,
  updates: { title?: string; description?: string; settings?: Partial<FormSettings>; is_published?: boolean }
) {
  const parsed = validate(updateFormSchema, { formId, updates })
  if (!parsed.success) throw new Error(parsed.error)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const validatedUpdates = parsed.data.updates
  const validatedFormId = parsed.data.formId

  // If settings is partial, merge with existing
  let settingsToUpdate = validatedUpdates.settings
  if (settingsToUpdate) {
    const { data: existing } = await supabase
      .from('forms')
      .select('settings')
      .eq('id', validatedFormId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      settingsToUpdate = { ...(existing.settings as unknown as FormSettings), ...settingsToUpdate }
    }
  }

  const { error } = await supabase
    .from('forms')
    .update({
      ...validatedUpdates,
      settings: settingsToUpdate as unknown as import('@/types/database').Json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', validatedFormId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${validatedFormId}`)
  revalidatePath('/dashboard')
}

export async function deleteForm(formId: string) {
  const parsed = validate(deleteFormSchema, { formId })
  if (!parsed.success) throw new Error(parsed.error)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', parsed.data.formId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function duplicateForm(formId: string) {
  const parsed = validate(duplicateFormSchema, { formId })
  if (!parsed.success) throw new Error(parsed.error)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const validatedFormId = parsed.data.formId

  // Fetch original form with questions
  const { data: original, error: fetchError } = await supabase
    .from('forms')
    .select('*, questions(*)')
    .eq('id', validatedFormId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !original) throw new Error('Form not found')

  const newSlug = generateSlug(original.title + ' copy')

  const { data: newForm, error: formError } = await supabase
    .from('forms')
    .insert({
      user_id: user.id,
      title: original.title + ' (Copy)',
      slug: newSlug,
      description: original.description,
      settings: original.settings,
      is_published: false,
    })
    .select()
    .single()

  if (formError || !newForm) throw new Error(formError?.message ?? 'Failed to duplicate form')

  // Copy questions
  const questions = (original as { questions: { form_id: string; id: string }[] }).questions
  if (questions && questions.length > 0) {
    const newQuestions = questions.map(({ form_id: _unused, id: _id, ...q }) => ({
      ...q,
      form_id: newForm.id,
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: qError } = await supabase.from('questions').insert(newQuestions as any)
    if (qError) throw new Error(qError.message)
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/${newForm.id}/edit`)
}
