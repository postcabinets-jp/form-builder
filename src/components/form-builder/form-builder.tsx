'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Form, Question, QuestionType } from '@/types/database'
import { addQuestion, reorderQuestions } from '@/app/actions/questions'
import { updateForm } from '@/app/actions/forms'
import { QuestionEditor } from './question-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  GripVertical,
  Globe,
  Lock,
  Type,
  Mail,
  Hash,
  List,
  CheckSquare,
  Star,
  Calendar,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.ElementType }[] = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'select', label: 'Multiple choice', icon: List },
  { type: 'multi_select', label: 'Checkboxes', icon: CheckSquare },
  { type: 'rating', label: 'Rating', icon: Star },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'file', label: 'File upload', icon: Upload },
]

interface FormBuilderProps {
  form: Form
  questions: Question[]
}

export function FormBuilder({ form, questions: initialQuestions }: FormBuilderProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(form.title)
  const [isPending, startTransition] = useTransition()
  const [showAddMenu, setShowAddMenu] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex(q => q.id === active.id)
    const newIndex = questions.findIndex(q => q.id === over.id)
    const reordered = arrayMove(questions, oldIndex, newIndex)
    setQuestions(reordered)

    startTransition(async () => {
      await reorderQuestions(form.id, reordered.map(q => q.id))
    })
  }

  async function handleAddQuestion(type: QuestionType) {
    setShowAddMenu(false)
    startTransition(async () => {
      try {
        const newQ = await addQuestion(form.id, type, questions.length)
        setQuestions(prev => [...prev, newQ as unknown as Question])
        setSelectedId(newQ.id)
      } catch {
        toast.error('Failed to add question')
      }
    })
  }

  async function handleTitleBlur() {
    if (title !== form.title && title.trim()) {
      startTransition(async () => {
        await updateForm(form.id, { title })
      })
    }
    setEditingTitle(false)
  }

  async function togglePublish() {
    startTransition(async () => {
      try {
        await updateForm(form.id, { is_published: !form.is_published })
        toast.success(form.is_published ? 'Form unpublished' : 'Form published!')
      } catch {
        toast.error('Failed to update form')
      }
    })
  }

  return (
    <div className="flex h-full">
      {/* Questions panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-100 bg-white">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {editingTitle ? (
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={e => e.key === 'Enter' && handleTitleBlur()}
                className="h-8 text-sm max-w-xs"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm font-medium text-zinc-900 hover:bg-zinc-50 px-2 py-1 rounded-md truncate max-w-xs"
              >
                {title}
              </button>
            )}
            <Badge variant={form.is_published ? 'default' : 'secondary'} className="text-xs shrink-0">
              {form.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <Button
            onClick={togglePublish}
            size="sm"
            variant={form.is_published ? 'outline' : 'default'}
            disabled={isPending}
          >
            {form.is_published ? (
              <><Lock className="w-3.5 h-3.5 mr-1.5" /> Unpublish</>
            ) : (
              <><Globe className="w-3.5 h-3.5 mr-1.5" /> Publish</>
            )}
          </Button>
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-y-auto p-6">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-zinc-500 mb-4">No questions yet. Add your first question.</p>
              <AddQuestionButton
                show={showAddMenu}
                onToggle={() => setShowAddMenu(!showAddMenu)}
                onAdd={handleAddQuestion}
              />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {questions.map((q, index) => (
                    <SortableQuestion
                      key={q.id}
                      question={q}
                      index={index}
                      isSelected={selectedId === q.id}
                      onSelect={() => setSelectedId(selectedId === q.id ? null : q.id)}
                      onUpdate={(updated) => {
                        setQuestions(prev => prev.map(p => p.id === updated.id ? updated : p))
                      }}
                      onDelete={() => {
                        setQuestions(prev => prev.filter(p => p.id !== q.id))
                        if (selectedId === q.id) setSelectedId(null)
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <div className="pt-2">
                <AddQuestionButton
                  show={showAddMenu}
                  onToggle={() => setShowAddMenu(!showAddMenu)}
                  onAdd={handleAddQuestion}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SortableQuestion({
  question,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: {
  question: Question
  index: number
  isSelected: boolean
  onSelect: () => void
  onUpdate: (q: Question) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group border rounded-xl bg-white transition-shadow',
        isDragging ? 'shadow-lg opacity-80' : 'shadow-sm',
        isSelected ? 'border-zinc-400 ring-1 ring-zinc-300' : 'border-zinc-200 hover:border-zinc-300'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3" onClick={onSelect}>
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xs text-zinc-400 w-5 shrink-0">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{question.title}</p>
          <p className="text-xs text-zinc-400 capitalize">{question.type.replace('_', ' ')}</p>
        </div>
        {question.required && (
          <span className="text-xs text-red-500 shrink-0">Required</span>
        )}
      </div>

      {isSelected && (
        <div className="border-t border-zinc-100 p-4">
          <QuestionEditor
            question={question}
            formId={question.form_id}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}

function AddQuestionButton({
  show,
  onToggle,
  onAdd,
}: {
  show: boolean
  onToggle: () => void
  onAdd: (type: QuestionType) => void
}) {
  return (
    <div className="relative">
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="w-full border-dashed text-zinc-400 hover:text-zinc-700 hover:border-zinc-300"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Add question
      </Button>
      {show && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg p-2 z-10 w-56">
          {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors text-left"
            >
              <Icon className="w-4 h-4 text-zinc-400" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
