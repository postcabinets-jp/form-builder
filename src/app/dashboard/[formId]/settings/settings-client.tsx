'use client'

import { useState, useTransition } from 'react'
import type { Form, FormSettings } from '@/types/database'
import { updateForm, deleteForm } from '@/app/actions/forms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

export function SettingsClient({ form }: { form: Form }) {
  const settings = form.settings as FormSettings
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState({
    title: form.title,
    description: form.description ?? '',
    mode: settings.mode,
    brandColor: settings.brandColor,
    showProgressBar: settings.showProgressBar,
    thankYouMessage: settings.thankYouMessage,
    notificationEmail: settings.notificationEmail ?? '',
    webhookUrl: settings.webhookUrl ?? '',
  })

  function handleSave() {
    startTransition(async () => {
      try {
        await updateForm(form.id, {
          title: values.title,
          description: values.description || undefined,
          settings: {
            mode: values.mode as FormSettings['mode'],
            brandColor: values.brandColor,
            showProgressBar: values.showProgressBar,
            thankYouMessage: values.thankYouMessage,
            notificationEmail: values.notificationEmail || undefined,
            webhookUrl: values.webhookUrl || undefined,
          },
        })
        toast.success('Settings saved')
      } catch {
        toast.error('Failed to save settings')
      }
    })
  }

  function handleDelete() {
    if (!confirm('Delete this form and all responses? This cannot be undone.')) return
    startTransition(async () => {
      await deleteForm(form.id)
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="space-y-6">
        {/* Basic settings */}
        <section className="bg-white border border-zinc-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Basic</h2>
          <div className="space-y-4">
            <div>
              <Label>Form title</Label>
              <Input
                value={values.title}
                onChange={e => setValues(v => ({ ...v, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={values.description}
                onChange={e => setValues(v => ({ ...v, description: e.target.value }))}
                className="mt-1"
                placeholder="Optional description shown to respondents"
              />
            </div>
          </div>
        </section>

        {/* Display settings */}
        <section className="bg-white border border-zinc-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Display</h2>
          <div className="space-y-4">
            <div>
              <Label>Form mode</Label>
              <Select
                value={values.mode}
                onValueChange={(v) => setValues(p => ({ ...p, mode: v as FormSettings['mode'] }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversational">Conversational (one question at a time)</SelectItem>
                  <SelectItem value="classic">Classic (all questions visible)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={values.brandColor}
                  onChange={e => setValues(v => ({ ...v, brandColor: e.target.value }))}
                  className="w-10 h-9 rounded-md border border-zinc-200 cursor-pointer p-0.5"
                />
                <Input
                  value={values.brandColor}
                  onChange={e => setValues(v => ({ ...v, brandColor: e.target.value }))}
                  className="font-mono text-sm w-28"
                  maxLength={7}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.showProgressBar}
                onChange={e => setValues(v => ({ ...v, showProgressBar: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-zinc-700">Show progress bar</span>
            </label>
          </div>
        </section>

        {/* Thank you page */}
        <section className="bg-white border border-zinc-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Thank you page</h2>
          <div>
            <Label>Message</Label>
            <Input
              value={values.thankYouMessage}
              onChange={e => setValues(v => ({ ...v, thankYouMessage: e.target.value }))}
              className="mt-1"
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white border border-zinc-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div>
              <Label>Email notification</Label>
              <Input
                value={values.notificationEmail}
                onChange={e => setValues(v => ({ ...v, notificationEmail: e.target.value }))}
                className="mt-1"
                type="email"
                placeholder="you@example.com (get notified on each response)"
              />
            </div>
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={values.webhookUrl}
                onChange={e => setValues(v => ({ ...v, webhookUrl: e.target.value }))}
                className="mt-1"
                type="url"
                placeholder="https://hooks.n8n.io/..."
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete form
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
