'use client'

import { useState, useTransition } from 'react'
import type { Question, QuestionOption } from '@/types/database'
import { updateQuestion, deleteQuestion } from '@/app/actions/questions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface QuestionEditorProps {
  question: Question
  formId: string
  onUpdate: (q: Question) => void
  onDelete: () => void
}

export function QuestionEditor({ question, formId, onUpdate, onDelete }: QuestionEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [localQ, setLocalQ] = useState(question)

  function handleField<K extends keyof Question>(key: K, value: Question[K]) {
    const updated = { ...localQ, [key]: value }
    setLocalQ(updated)
  }

  function save() {
    startTransition(async () => {
      try {
        await updateQuestion(question.id, formId, {
          title: localQ.title,
          description: localQ.description ?? undefined,
          required: localQ.required,
          options: localQ.options,
          logic: localQ.logic,
        })
        onUpdate(localQ)
        toast.success('Saved')
      } catch {
        toast.error('Failed to save')
      }
    })
  }

  function handleDelete() {
    if (!confirm('Delete this question?')) return
    startTransition(async () => {
      try {
        await deleteQuestion(question.id, formId)
        onDelete()
      } catch {
        toast.error('Failed to delete question')
      }
    })
  }

  function addOption() {
    const opts = [...(localQ.options ?? [])]
    const newOpt: QuestionOption = {
      id: crypto.randomUUID(),
      label: `Option ${opts.length + 1}`,
      value: `option_${opts.length + 1}`,
    }
    handleField('options', [...opts, newOpt])
  }

  function updateOption(id: string, label: string) {
    const opts = (localQ.options ?? []).map(o =>
      o.id === id ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, '_') } : o
    )
    handleField('options', opts)
  }

  function removeOption(id: string) {
    handleField('options', (localQ.options ?? []).filter(o => o.id !== id))
  }

  const hasOptions = ['select', 'multi_select'].includes(question.type)

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-zinc-500">Question</Label>
          <Input
            value={localQ.title}
            onChange={e => handleField('title', e.target.value)}
            className="mt-1 text-sm"
            placeholder="Enter your question"
          />
        </div>
        <div>
          <Label className="text-xs text-zinc-500">Description (optional)</Label>
          <Input
            value={localQ.description ?? ''}
            onChange={e => handleField('description', e.target.value || null)}
            className="mt-1 text-sm"
            placeholder="Add a description or hint"
          />
        </div>

        {hasOptions && (
          <div>
            <Label className="text-xs text-zinc-500">Options</Label>
            <div className="mt-1 space-y-1.5">
              {(localQ.options ?? []).map(opt => (
                <div key={opt.id} className="flex items-center gap-2">
                  <Input
                    value={opt.label}
                    onChange={e => updateOption(opt.id, e.target.value)}
                    className="text-sm h-8"
                  />
                  <button
                    onClick={() => removeOption(opt.id)}
                    className="text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors mt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add option
              </button>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localQ.required}
            onChange={e => handleField('required', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-zinc-700">Required</span>
        </label>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete question
        </button>
        <Button size="sm" onClick={save} disabled={isPending}>
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
