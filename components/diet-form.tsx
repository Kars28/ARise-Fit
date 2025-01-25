"use client"

import { useState } from "react"
import axios from "axios"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DietForm() {
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    dairy_allergy: false,
    blood_sugar: null,
    thyroxine: null,
    cholesterol: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = new FormData()
    data.append("weight", formData.weight)
    data.append("height", formData.height)
    data.append("dairy_allergy", formData.dairy_allergy)

    if (formData.blood_sugar) data.append("blood_sugar", formData.blood_sugar)
    if (formData.thyroxine) data.append("thyroxine", formData.thyroxine)
    if (formData.cholesterol) data.append("cholesterol", formData.cholesterol)

    try {
      await axios.post("/diet", data)
      // Handle success - you can add toast notification or redirect here
    } catch (error) {
      console.error("Error submitting data:", error)
      // Handle error - you can add toast notification here
    }

    setIsSubmitting(false)
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
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, dairy_allergy: checked }))}
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

          <Button type="submit" disabled={isSubmitting} className="w-full" variant="destructive">
            {isSubmitting ? "Analyzing..." : "Submit Analysis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

