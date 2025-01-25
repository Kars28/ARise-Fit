"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, Download, Dumbbell } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer"
import Link from "next/link"
// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
})

// PDF Document component
const MyDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>AI Analysis Results</Text>
        {Object.keys(data["Extracted Results"]).map((fileName) => (
          <View key={fileName}>
            <Text style={styles.subtitle}>{fileName}</Text>
            <Text style={styles.text}>Extracted Data:</Text>
            <Text style={styles.text}>
              {JSON.stringify(data["Extracted Results"][fileName].extracted_data, null, 2)}
            </Text>
            <Text style={styles.text}>Health Recommendations:</Text>
            <Text style={styles.text}>
              {JSON.stringify(data["Extracted Results"][fileName].recommendations, null, 2)}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

const FileUpload = () => {
  const [files, setFiles] = useState<FileList | null>(null)
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length <= 3) {
      setFiles(event.target.files)
    } else {
      setNotification({ type: "error", message: "Please select up to 3 PDF files." })
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!files) {
      setNotification({ type: "error", message: "Please select files to upload" })
      return
    }

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("file", file)
    })

    setLoading(true)
    setNotification(null)

    try {
      const res = await axios.post("http://localhost:5000/analyzereport", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setResponse(res.data)
      setNotification({ type: "success", message: "Files uploaded and analyzed successfully." })
    } catch (error) {
      console.error("Error uploading files", error)
      setNotification({ type: "error", message: "Error uploading files" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-black text-white p-4 md:p-8">
        <nav className="border-b border-zinc-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-red-600" />
            <span className="text-3xl font-bold">ARiseFit</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="hover:text-red-500 transition-colors text-xl font-medium">Features</Link>
            <Link href="#ai" className="hover:text-red-500 transition-colors text-xl font-medium">AI Coach</Link>

          </div>
        </div>
      </nav>
      <Card className="max-w-4xl mx-auto bg-black bg-opacity-50 backdrop-blur-lg rounded-xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
            Upload Health Reports
          </CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Upload your PDF reports for AI analysis and health recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-gray-300">
                Choose PDF files (3 files max):
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-red-600 rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  <Upload className="w-5 h-5 text-red-500" />
                  <span>Choose files</span>
                </Label>
                <span className="text-sm text-gray-400">
                  {files ? `${files.length} file(s) selected` : "No files chosen"}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 rounded-md transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading and Extracting...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload and Extract
                </>
              )}
            </Button>
          </form>
        </CardContent>
        
      </Card>

      {response && (
        <Card className="mt-8 max-w-4xl mx-auto bg-black bg-opacity-50 backdrop-blur-lg rounded-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold mb-2 text-red-500">Extracted Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.keys(response["Extracted Results"]).map((fileName) => (
              <div key={fileName} className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-semibold mb-2 text-orange-500">{fileName}</h3>
                <div className="bg-gray-900 rounded p-2 mb-2">
                  <h4 className="text-lg font-semibold mb-1 text-red-400">Extracted Data:</h4>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(response["Extracted Results"][fileName].extracted_data, null, 2)}
                  </pre>
                </div>
                <div className="bg-gray-900 rounded p-2">
                  <h4 className="text-lg font-semibold mb-1 text-red-400">Health Recommendations:</h4>
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(response["Extracted Results"][fileName].recommendations, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <PDFDownloadLink
              document={<MyDocument data={response} />}
              fileName="ai_analysis_results.pdf"
              className="w-full"
            >
              {({ blob, url, loading, error }) => (
                <Button
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 rounded-md transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF Report
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

export default FileUpload

