'use client'

import { useState } from 'react'
import type { Form, Question, FormSettings, Json } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ClassicViewProps {
  form: Form
  questions: Question[]
  settings: FormSettings
  onSubmit: (answers: Record<string, Json>) => void
  submitting: boolean
  error: string | null
}

export function ClassicView({
  form,
  questions,
  settings,
  onSubmit,
  submitting,
  error,
}: ClassicViewProps) {
  const [answers, setAnswers] = useState<Record<string, Json>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  function handleChange(questionId: string, value: Json) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    setValidationErrors(prev => ({ ...prev, [questionId]: '' }))
  }

  function validate() {
    const errors: Record<string, string> = {}
    questions.forEach(q => {
      if (!q.required) return
      const val = answers[q.id]
      if (val === null || val === undefined || val === '') {
        errors[q.id] = 'This field is required'
      }
      if (Array.isArray(val) && val.length === 0) {
        errors[q.id] = 'Please select at least one option'
      }
    })
    return errors
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    onSubmit(answers)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div
            className="w-1 h-8 rounded-full mb-4"
            style={{ backgroundColor: settings.brandColor }}
          />
          <h1 className="text-2xl font-semibold text-zinc-900">{form.title}</h1>
          {form.description && (
            <p className="text-base text-zinc-500 mt-2">{form.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q, i) => (
            <div key={q.id}>
              <Label className="text-base font-medium text-zinc-900">
                {i + 1}. {q.title}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {q.description && (
                <p className="text-sm text-zinc-500 mt-1 mb-3">{q.description}</p>
              )}
              <div className="mt-2">
                <ClassicInput
                  question={q}
                  value={answers[q.id] ?? ''}
                  onChange={(v) => handleChange(q.id, v)}
                  brandColor={settings.brandColor}
                />
              </div>
              {validationErrors[q.id] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors[q.id]}</p>
              )}
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: settings.brandColor }}
            className="text-white border-0 hover:opacity-90 px-8"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>

        <p className="text-xs text-zinc-400 mt-8 text-center">
          Powered by{' '}
          <a href="/" className="hover:text-zinc-600 transition-colors">
            form-builder
          </a>
        </p>
      </div>
    </div>
  )
}

function ClassicInput({
  question,
  value,
  onChange,
  brandColor,
}: {
  question: Question
  value: Json
  onChange: (v: Json) => void
  brandColor: string
}) {
  switch (question.type) {
    case 'text':
      return (
        <Input
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder="Your answer"
        />
      )

    case 'email':
      return (
        <Input
          type="email"
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder="your@email.com"
        />
      )

    case 'number':
      return (
        <Input
          type="number"
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
          placeholder="Enter a number"
        />
      )

    case 'date':
      return (
        <Input
          type="date"
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value)}
        />
      )

    case 'select':
      return (
        <div className="space-y-2">
          {question.options.map(opt => (
            <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="accent-current"
                style={{ accentColor: brandColor }}
              />
              <span className="text-sm text-zinc-700">{opt.label}</span>
            </label>
          ))}
        </div>
      )

    case 'multi_select': {
      const selected = (value as string[] | null) ?? []
      return (
        <div className="space-y-2">
          {question.options.map(opt => (
            <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                value={opt.value}
                checked={selected.includes(opt.value)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...selected, opt.value]
                    : selected.filter(v => v !== opt.value)
                  onChange(next)
                }}
                className="rounded accent-current"
                style={{ accentColor: brandColor }}
              />
              <span className="text-sm text-zinc-700">{opt.label}</span>
            </label>
          ))}
        </div>
      )
    }

    case 'rating': {
      const rating = value as number | null
      return (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all ${
                rating === n ? 'text-white' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
              }`}
              style={rating === n ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
            >
              {n}
            </button>
          ))}
        </div>
      )
    }

    default:
      return null
  }
}
