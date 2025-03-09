"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface ExportSaveProps {
  saveData: any
  lzw_encode: (data: string) => string
}

export function ExportSave({ saveData, lzw_encode }: ExportSaveProps) {
  const [encodedSave, setEncodedSave] = useState("")
  const [jsonSave, setJsonSave] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const jsonString = JSON.stringify(saveData, null, 2)
      setJsonSave(jsonString)

      const encoded = lzw_encode(JSON.stringify(saveData))
      setEncodedSave(encoded)
    } catch {
      toast("Export error", {
        description: "Failed to encode save data.",
      })
    }
  }, [saveData, lzw_encode, toast])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast("Copied to clipboard", {
      description: "The save data has been copied to your clipboard.",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast("Save downloaded", {
      description: `Your save has been downloaded as ${filename}`,
    })
  }

  return (
    <Card className="border border-blue-200">
      <CardHeader>
        <CardTitle>Export Save</CardTitle>
        <CardDescription>Copy or download your modified save data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="encoded" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="encoded">Encoded (Game Format)</TabsTrigger>
            <TabsTrigger value="json">JSON (Readable)</TabsTrigger>
          </TabsList>

          <TabsContent value="encoded">
            <div className="space-y-4">
              <Textarea readOnly className="min-h-[200px] font-mono text-xs" value={encodedSave} />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleCopy(encodedSave)}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>

                <Button
                  className="flex-1 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600"
                  onClick={() => handleDownload(encodedSave, "case-clicker-save.save")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Save
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="json">
            <div className="space-y-4">
              <Textarea readOnly className="min-h-[300px] font-mono text-xs" value={jsonSave} />

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleCopy(jsonSave)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy JSON
                </Button>

                <Button className="flex-1" onClick={() => handleDownload(jsonSave, "case-clicker-save.json")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

