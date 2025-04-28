"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dumbbell, Utensils, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type FormData = {
  name: string
  age: string
  gender: string
  weight: string
  height: string
  diseases: string
  activity_level: string
  goal: string
  dairy_allergy: boolean
  peanut_allergy: boolean
  bloodReport: File | null
  cholesterolReport: File | null
  thyroxineReport: File | null
}

interface Results {
  analysis: {
    blood: Record<string, string>;
    cholesterol: Record<string, string>;
    thyroxine: Record<string, string>;
  } | null;
  diet_recommendations: {
    breakfast: Array<{ item: string; calories: number }>;
    lunch: Array<{ item: string; calories: number }>;
    dinner: Array<{ item: string; calories: number }>;
    snacks: Array<{ item: string; calories: number }>;
    daily_calories: number;
  } | null;
  health_status: {
    weight_status: string;
    recommendations: string[];
  };
  pdf_url?: string;
}

export default function AIDietWorkoutRecommendation() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    diseases: "",
    activity_level: "",
    goal: "",
    dairy_allergy: false,
    peanut_allergy: false,
    bloodReport: null,
    cholesterolReport: null,
    thyroxineReport: null,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Results | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    if (type === "file") {
      const file = e.target.files?.[0] || null
      setFormData({ ...formData, [name]: file })
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: e.target.checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.bloodReport || !formData.cholesterolReport || !formData.thyroxineReport) {
      setError('Please upload all three medical reports')
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      
      // Add files
      formDataToSend.append('file', formData.bloodReport)
      formDataToSend.append('file', formData.cholesterolReport)
      formDataToSend.append('file', formData.thyroxineReport)

      // Add user info
      formDataToSend.append('name', formData.name)
      formDataToSend.append('age', formData.age)
      formDataToSend.append('weight', formData.weight)
      formDataToSend.append('height', formData.height)
      formDataToSend.append('dairy_allergy', formData.dairy_allergy.toString())
      formDataToSend.append('peanut_allergy', formData.peanut_allergy.toString())

      const response = await fetch("http://localhost:5000/analyzereport", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to generate recommendation")
      }

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Navigation */}
      <nav className="border-b border-blue-200 bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">ARiseFit</span>
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
            Get Your Personalized Diet Plan
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 rounded-t-xl">
                <CardTitle className="text-blue-900">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-900">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-blue-900">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="0"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-blue-900">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.1"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-blue-900">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.1"
                      className="border-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 rounded-t-xl">
                <CardTitle className="text-blue-900">Upload Medical Reports</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bloodReport" className="text-blue-900">Blood Report</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="bloodReport"
                        name="bloodReport"
                        type="file"
                        accept=".pdf"
                        onChange={handleChange}
                        required
                        className="border-blue-200 focus:border-blue-500"
                      />
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cholesterolReport" className="text-blue-900">Cholesterol Report</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="cholesterolReport"
                        name="cholesterolReport"
                        type="file"
                        accept=".pdf"
                        onChange={handleChange}
                        required
                        className="border-blue-200 focus:border-blue-500"
                      />
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thyroxineReport" className="text-blue-900">Thyroxine Report</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="thyroxineReport"
                        name="thyroxineReport"
                        type="file"
                        accept=".pdf"
                        onChange={handleChange}
                        required
                        className="border-blue-200 focus:border-blue-500"
                      />
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50 rounded-t-xl">
                <CardTitle className="text-blue-900">Allergies</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex space-x-8">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dairy_allergy"
                      name="dairy_allergy"
                      checked={formData.dairy_allergy}
                      onCheckedChange={(checked) => setFormData({ ...formData, dairy_allergy: checked as boolean })}
                      className="border-blue-200 data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="dairy_allergy" className="text-blue-900">Dairy Allergy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="peanut_allergy"
                      name="peanut_allergy"
                      checked={formData.peanut_allergy}
                      onCheckedChange={(checked) => setFormData({ ...formData, peanut_allergy: checked as boolean })}
                      className="border-blue-200 data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="peanut_allergy" className="text-blue-900">Peanut Allergy</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Generate Recommendations"}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <div className="mt-8 space-y-6">
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 rounded-t-xl">
                  <CardTitle className="text-blue-900">Health Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-900">Weight Status: {results.health_status.weight_status}</p>
                    <ul className="list-disc pl-4 text-blue-800">
                      {results.health_status.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 rounded-t-xl">
                  <CardTitle className="text-blue-900">Diet Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="font-semibold text-blue-900">Daily Calorie Target: {results.diet_recommendations?.daily_calories} kcal</p>
                    {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
                      <div key={meal} className="space-y-2">
                        <h3 className="font-semibold capitalize text-blue-900">{meal}</h3>
                        <ul className="list-disc pl-4 text-blue-800">
                          {results.diet_recommendations?.[meal].map((item: { item: string; calories: number }, index: number) => (
                            <li key={index}>
                              {item.item} ({item.calories} kcal)
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {results.pdf_url && (
                <div className="text-center">
                  <Button
                    onClick={() => window.open(results.pdf_url, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Download PDF Report
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}