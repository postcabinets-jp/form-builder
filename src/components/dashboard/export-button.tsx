'use client'

import { useState, useTransition } from 'react'
import { exportSubmissions } from '@/app/actions/submissions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download } from 'lucide-react'

export function ExportButton({ formId }: { formId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleExport(format: 'csv' | 'json') {
    startTransition(async () => {
      const result = await exportSubmissions(formId, format)
      if (result.error || !result.data) return

      const blob = new Blob(
        [format === 'json' ? JSON.stringify(result.data, null, 2) : result.data as string],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename ?? `responses.${format}`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={isPending} />}>
        <Download className="w-3.5 h-3.5 mr-1.5" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
