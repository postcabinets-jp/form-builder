import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormBuilder } from '@/components/form-builder/form-builder'
import type { Form, Question } from '@/types/database'

export default async function EditFormPage({
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
    .select('*')
    .eq('form_id', formId)
    .order('sort_order')

  return <FormBuilder form={form as unknown as Form} questions={(questions ?? []) as unknown as Question[]} />
}
