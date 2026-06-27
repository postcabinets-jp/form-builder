'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, Copy, Globe, Code } from 'lucide-react'
import type { Form } from '@/types/database'

export function ShareClient({ form, appUrl }: { form: Form; appUrl: string }) {
  const publicUrl = `${appUrl}/f/${form.slug}`
  const iframeCode = `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0" style="border:none;"></iframe>`
  const popupCode = `<script>
  function openForm() {
    window.open('${publicUrl}', 'form', 'width=600,height=700,centered');
  }
</script>
<button onclick="openForm()">Open form</button>`

  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!form.is_published) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
          <Globe className="w-5 h-5 text-zinc-400" />
        </div>
        <h2 className="text-base font-semibold text-zinc-900">Publish to share</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Your form is currently a draft. Publish it to get a shareable link.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Tabs defaultValue="link">
        <TabsList className="mb-6">
          <TabsTrigger value="link">Link</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <Label className="text-sm font-medium">Public URL</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input value={publicUrl} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(publicUrl, 'url')}
                className="shrink-0"
              >
                {copied === 'url' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Share this link with anyone to collect responses.
            </p>
          </div>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full" variant="outline">
              Open form ↗
            </Button>
          </a>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Code className="w-4 h-4" /> iframe embed
            </Label>
            <div className="mt-2">
              <pre className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs font-mono text-zinc-700 overflow-x-auto whitespace-pre-wrap">
                {iframeCode}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => copy(iframeCode, 'iframe')}
              >
                {copied === 'iframe' ? (
                  <><Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Copied</>
                ) : (
                  <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy code</>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <Label className="text-sm font-medium">Popup embed</Label>
            <div className="mt-2">
              <pre className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs font-mono text-zinc-700 overflow-x-auto whitespace-pre-wrap">
                {popupCode}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => copy(popupCode, 'popup')}
              >
                {copied === 'popup' ? (
                  <><Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> Copied</>
                ) : (
                  <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy code</>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
