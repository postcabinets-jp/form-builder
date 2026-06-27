'use client'

import { useState } from 'react'
import type { Form, Question, FormSettings, Json } from '@/types/database'
import { submitForm } from '@/app/actions/submissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConversationalView } from './conversational-view'
import { ClassicView } from './classic-view'

interface FormViewerProps {
  form: Form
  questions: Question[]
}

export function FormViewer({ form, questions }: FormViewerProps) {
  const settings = form.settings as FormSettings
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(answers: Record<string, Json>) {
    setSubmitting(true)
    setError(null)
    const result = await submitForm(form.id, answers, {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    })

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: `${settings.brandColor}10` }}
      >
        <div className="text-center max-w-md px-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: settings.brandColor }}
          >
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            {settings.thankYouMessage}
          </h2>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500 text-sm">This form has no questions yet.</p>
      </div>
    )
  }

  return settings.mode === 'conversational' ? (
    <ConversationalView
      form={form}
      questions={questions}
      settings={settings}
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
    />
  ) : (
    <ClassicView
      form={form}
      questions={questions}
      settings={settings}
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
    />
  )
}
