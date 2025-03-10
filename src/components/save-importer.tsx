"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileUp } from "lucide-react"
import { toast } from "sonner"

interface SaveImporterProps {
  onImport: (saveString: string) => void
  isMobileDevice?: boolean
}

export function SaveImporter({ onImport, isMobileDevice = false }: SaveImporterProps) {
  const [saveString, setSaveString] = useState("")
  
  const supportedExtensions = ['txt', 'json', 'save'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const filePath = file.name.split('.');
    const extension = filePath[filePath.length - 1].toLowerCase();
    
    // https://stackoverflow.com/a/53234855
    // taken from the lovely  mr jabacchetta from stackoverflow
    if (supportedExtensions.includes(extension)) {
      // Upload as usual
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setSaveString(content)
      }
      reader.readAsText(file)
    } else {
      toast("Unsupported file format", {
        description: `Please upload a file with one of these extensions: ${supportedExtensions.join(', ')}`,
      });
      
      // Reset input value
      e.target.value = '';

      return;
    }
  }

  return (
    <Card className="border border-blue-200">
      <CardHeader>
        <CardTitle>Import Save</CardTitle>
        <CardDescription>Paste your encoded/decoded save data or upload a save file</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <Textarea
            placeholder="paste your encoded or decoded json (idc) save data here..."
            className="min-h-[150px] font-mono text-xs"
            value={saveString}
            onChange={(e) => setSaveString(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-10 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
              >
                <FileUp className="mr-2 h-4 w-4" />
                <span>Upload Save File</span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept={isMobileDevice ? undefined : ".txt,.json,.save"}
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <Button
              className="flex-1 bg-gradient-to-r from-indigo-800 to-slate-900"
              onClick={() => onImport(saveString)}
              disabled={!saveString}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

