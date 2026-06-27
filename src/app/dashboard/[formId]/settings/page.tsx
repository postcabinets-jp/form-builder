import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Form } from '@/types/database'
import { SettingsClient } from './settings-client'

export default async function SettingsPage({
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

  return <SettingsClient form={form as unknown as Form} />
}
