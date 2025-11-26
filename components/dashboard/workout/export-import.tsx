"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Download, Upload } from "lucide-react"

interface ExportImportProps {
  userId: string
  onImportComplete?: () => void
}

export function ExportImport({ userId, onImportComplete }: ExportImportProps) {
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // In a real app, you would fetch all user data from the database
      const data = {
        userId,
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: {
          // This would be populated with actual user data
          mesocycles: [],
          exercises: [],
          workoutLogs: [],
        },
      }

      setExportData(JSON.stringify(data, null, 2))

      toast({
        title: "Export Successful",
        description: "Your data has been exported. Copy it or download the file.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      // Validate the import data
      const data = JSON.parse(importData)

      if (!data.userId || !data.timestamp || !data.version || !data.data) {
        throw new Error("Invalid import data format")
      }

      // In a real app, you would process and save the imported data

      toast({
        title: "Import Successful",
        description: "Your data has been imported successfully.",
      })

      if (onImportComplete) {
        onImportComplete()
      }

      setImportData("")
    } catch (error) {
      console.error("Import error:", error)
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "There was an error importing your data. Please check the format and try again.",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const downloadExport = () => {
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gymtrack-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export/Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export or Import Your Data</DialogTitle>
          <DialogDescription>
            Export your workout data to back it up or import previously exported data.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Export all your workout data including mesocycles, exercises, and workout logs.
              </p>
              <Button onClick={handleExport} disabled={isExporting} className="w-full">
                {isExporting ? "Exporting..." : "Generate Export Data"}
              </Button>
            </div>

            {exportData && (
              <div className="space-y-2">
                <Textarea value={exportData} readOnly className="h-[200px] font-mono text-xs" />
                <Button onClick={downloadExport} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download JSON File
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Import previously exported workout data. This will merge with your existing data.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload JSON File
                    <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground text-center">or</p>
                <Textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your export data here..."
                  className="h-[200px] font-mono text-xs"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {importData && (
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? "Importing..." : "Import Data"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
