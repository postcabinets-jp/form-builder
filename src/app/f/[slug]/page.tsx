import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormViewer } from '@/components/form-viewer/form-viewer'
import type { Form, Question } from '@/types/database'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: form } = await supabase
    .from('forms')
    .select('title, description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!form) return { title: 'Form not found' }

  return {
    title: form.title,
    description: form.description,
  }
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!form) notFound()

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('form_id', form.id)
    .order('sort_order')

  return <FormViewer form={form as unknown as Form} questions={(questions ?? []) as unknown as Question[]} />
}
