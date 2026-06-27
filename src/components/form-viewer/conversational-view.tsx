'use client'

import { useState, useEffect, useRef } from 'react'
import type { Form, Question, FormSettings, Json } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ArrowRight } from 'lucide-react'

interface ConversationalViewProps {
  form: Form
  questions: Question[]
  settings: FormSettings
  onSubmit: (answers: Record<string, Json>) => void
  submitting: boolean
  error: string | null
}

export function ConversationalView({
  form,
  questions,
  settings,
  onSubmit,
  submitting,
  error,
}: ConversationalViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Json>>({})
  const [currentValue, setCurrentValue] = useState<Json>('')
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const inputRef = useRef<HTMLInputElement>(null)

  const current = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const progress = ((currentIndex) / questions.length) * 100

  useEffect(() => {
    // Load any existing answer for this question
    setCurrentValue(answers[current?.id] ?? '')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [currentIndex, current?.id])

  function canProceed() {
    if (!current.required) return true
    const val = currentValue
    if (val === null || val === undefined || val === '') return false
    if (Array.isArray(val) && val.length === 0) return false
    return true
  }

  function handleNext() {
    if (!canProceed()) return

    const newAnswers = { ...answers, [current.id]: currentValue }
    setAnswers(newAnswers)

    if (isLast) {
      onSubmit(newAnswers)
    } else {
      setDirection('forward')
      setCurrentIndex(i => i + 1)
    }
  }

  function handleBack() {
    if (currentIndex === 0) return
    setAnswers(prev => ({ ...prev, [current.id]: currentValue }))
    setDirection('back')
    setCurrentIndex(i => i - 1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: `${settings.brandColor}08` }}
    >
      {/* Progress bar */}
      {settings.showProgressBar && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-100 z-10">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: settings.brandColor,
            }}
          />
        </div>
      )}

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <div className="mb-1.5">
            <span className="text-xs font-mono text-zinc-400">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3 leading-tight">
            {current.title}
            {current.required && <span className="text-red-500 ml-1">*</span>}
          </h2>

          {current.description && (
            <p className="text-base text-zinc-500 mb-6">{current.description}</p>
          )}

          {/* Input based on type */}
          <div className="mb-6">
            <QuestionInput
              question={current}
              value={currentValue}
              onChange={setCurrentValue}
              brandColor={settings.brandColor}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {currentIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-zinc-500"
              >
                ← Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              style={{ backgroundColor: settings.brandColor }}
              className="text-white px-6 border-0 hover:opacity-90"
            >
              {submitting ? (
                'Submitting...'
              ) : isLast ? (
                'Submit'
              ) : (
                <>Next <ArrowRight className="w-4 h-4 ml-1.5" /></>
              )}
            </Button>
          </div>

          {!current.required && (
            <button
              onClick={handleNext}
              className="mt-3 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Skip this question →
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-4">
        <a
          href="/"
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Powered by form-builder
        </a>
      </div>
    </div>
  )
}

function QuestionInput({
  question,
  value,
  onChange,
  brandColor,
  onKeyDown,
  inputRef,
}: {
  question: Question
  value: Json
  onChange: (v: Json) => void
  brandColor: string
  onKeyDown: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  switch (question.type) {
    case 'text':
      return (
        <Input
          ref={inputRef}
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your answer..."
          className="text-lg h-12 border-0 border-b-2 rounded-none bg-transparent px-0 focus-visible:ring-0"
          style={{ borderBottomColor: brandColor }}
        />
      )

    case 'email':
      return (
        <Input
          ref={inputRef}
          type="email"
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="your@email.com"
          className="text-lg h-12 border-0 border-b-2 rounded-none bg-transparent px-0 focus-visible:ring-0"
          style={{ borderBottomColor: brandColor }}
        />
      )

    case 'number':
      return (
        <Input
          ref={inputRef}
          type="number"
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : '')}
          onKeyDown={onKeyDown}
          placeholder="Enter a number..."
          className="text-lg h-12 border-0 border-b-2 rounded-none bg-transparent px-0 focus-visible:ring-0"
          style={{ borderBottomColor: brandColor }}
        />
      )

    case 'select':
      return (
        <div className="space-y-2">
          {question.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => onChange(opt.value)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg border-2 transition-all text-left ${
                value === opt.value
                  ? 'border-current text-white'
                  : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
              }`}
              style={value === opt.value ? { borderColor: brandColor, backgroundColor: brandColor } : {}}
            >
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      )

    case 'multi_select': {
      const selected = (value as string[] | null) ?? []
      return (
        <div className="space-y-2">
          {question.options.map(opt => {
            const isChecked = selected.includes(opt.value)
            return (
              <button
                key={opt.id}
                onClick={() => {
                  const next = isChecked
                    ? selected.filter(v => v !== opt.value)
                    : [...selected, opt.value]
                  onChange(next)
                }}
                className={`flex items-center gap-3 w-full p-3 rounded-lg border-2 transition-all text-left ${
                  isChecked
                    ? 'border-current text-white'
                    : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                }`}
                style={isChecked ? { borderColor: brandColor, backgroundColor: brandColor } : {}}
              >
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            )
          })}
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
              onClick={() => onChange(n)}
              className={`w-12 h-12 rounded-lg border-2 text-sm font-semibold transition-all ${
                rating === n
                  ? 'text-white border-transparent'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
              }`}
              style={rating === n ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
            >
              {n}
            </button>
          ))}
        </div>
      )
    }

    case 'date':
      return (
        <Input
          ref={inputRef}
          type="date"
          value={value as string ?? ''}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="text-lg h-12 border-0 border-b-2 rounded-none bg-transparent px-0 focus-visible:ring-0"
          style={{ borderBottomColor: brandColor }}
        />
      )

    case 'file':
      return (
        <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center">
          <p className="text-sm text-zinc-500">File upload</p>
          <p className="text-xs text-zinc-400 mt-1">Click to select a file</p>
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) onChange(file.name)
            }}
          />
        </div>
      )

    default:
      return null
  }
}
