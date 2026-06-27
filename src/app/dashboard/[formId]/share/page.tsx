import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Form } from '@/types/database'
import { ShareClient } from './share-client'

export default async function SharePage({
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://form-builder-oss.vercel.app'

  return <ShareClient form={form as unknown as Form} appUrl={appUrl} />
}
