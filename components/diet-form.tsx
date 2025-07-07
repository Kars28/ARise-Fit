"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define the API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface FormData {
  weight: string;
  height: string;
  dairy_allergy: boolean;
  blood_sugar: File | null;
  thyroxine: File | null;
  cholesterol: File | null;
}

const initialFormData: FormData = {
  weight: "",
  height: "",
  dairy_allergy: false,
  blood_sugar: null,
  thyroxine: null,
  cholesterol: null,
}

export default function DietForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }))
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dairy_allergy: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const data = new FormData()
      data.append("weight", formData.weight)
      data.append("height", formData.height)
      data.append("dairy_allergy", String(formData.dairy_allergy))

      // Only append files if they exist
      if (formData.blood_sugar) data.append("blood_sugar", formData.blood_sugar)
      if (formData.thyroxine) data.append("thyroxine", formData.thyroxine)
      if (formData.cholesterol) data.append("cholesterol", formData.cholesterol)

      const response = await axios.post(`${API_URL}/diet`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data) {
        toast({
          title: "Success",
          description: "Analysis submitted successfully!",
        })
        // Reset form after successful submission
        setFormData(initialFormData)
      }
    } catch (error) {
      console.error("Error submitting data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit analysis",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <Card className="w-full max-w-2xl bg-zinc-900 text-white">
      <CardHeader>
        <CardTitle>Diet Analysis Form</CardTitle>
        <CardDescription className="text-zinc-400">Enter your details to get a personalized diet plan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                min="20"
                max="300"
                className="border-zinc-800 bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                required
                min="100"
                max="250"
                className="border-zinc-800 bg-zinc-950"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="dairy_allergy"
              name="dairy_allergy"
              checked={formData.dairy_allergy}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="dairy_allergy">Dairy Allergy</Label>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {["blood_sugar", "thyroxine", "cholesterol"].map((report) => (
              <div key={report} className="space-y-2">
                <Label htmlFor={report}>{report.split("_").join(" ").toUpperCase()} Report</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={report}
                    type="file"
                    name={report}
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="border-zinc-800 bg-zinc-950"
                  />
                  <Upload className="h-4 w-4 text-zinc-500" />
                </div>
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full" 
            variant="destructive"
          >
            {isSubmitting ? "Analyzing..." : "Submit Analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

