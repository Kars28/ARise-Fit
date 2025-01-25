"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dumbbell, Utensils, Upload } from "lucide-react"
import Link from "next/link"

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
  reports: File[]
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
    reports: [],
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    if (type === "file") {
      setFormData({ ...formData, reports: Array.from(e.target.files || []) })
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

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "reports") {
          formData.reports.forEach((file) => formDataToSend.append("reports", file))
        } else {
          formDataToSend.append(key, value.toString())
        }
      })

      const response = await fetch("http://127.0.0.1:5000/diet", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error("Failed to generate recommendation")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "AI_Diet_Workout_Recommendation.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()

      toast({
        title: "Success",
        description: "Your AI diet and workout recommendation has been generated and downloaded.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-black to-black text-white p-4 md:p-8">
      {/* Navigation */}
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
      <div className="max-w-4xl mx-auto bg-black bg-opacity-50 backdrop-blur-lg rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          AI Diet and Workout Recommendation
        </h1>
        <div className="flex items-center justify-center space-x-4 mb-8">
          <Dumbbell className="w-8 h-8 text-red-500" />
          <Utensils className="w-8 h-8 text-orange-500" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-gray-800 border-red-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-gray-300">
                Age
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
                className="bg-gray-800 border-red-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-gray-300">
                Gender
              </Label>
              <Select
                name="gender"
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger className="bg-gray-800 border-red-600 text-white focus:ring-red-500 focus:border-red-500">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-gray-300">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                required
                className="bg-gray-800 border-red-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-gray-300">
                Height (cm)
              </Label>
              <Input
                id="height"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                required
                className="bg-gray-800 border-red-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diseases" className="text-gray-300">
                Diseases (if any)
              </Label>
              <Input
                id="diseases"
                name="diseases"
                value={formData.diseases}
                onChange={handleChange}
                className="bg-gray-800 border-red-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity_level" className="text-gray-300">
                Activity Level (1-5)
              </Label>
              <Input
                id="activity_level"
                name="activity_level"
                type="number"
                min="1"
                max="5"
                value={formData.activity_level}
                onChange={handleChange}
                required
                className="bg-gray-800 border-red-600 text-white placeholder-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal" className="text-gray-300">
                Goal
              </Label>
              <Select name="goal" value={formData.goal} onValueChange={(value) => handleSelectChange("goal", value)}>
                <SelectTrigger className="bg-gray-800 border-red-600 text-white focus:ring-red-500 focus:border-red-500">
                  <SelectValue placeholder="Select Goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Lose Weight</SelectItem>
                  <SelectItem value="2">Gain Weight</SelectItem>
                  <SelectItem value="3">Stay Healthy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dairy_allergy"
              name="dairy_allergy"
              checked={formData.dairy_allergy}
              onCheckedChange={(checked) => setFormData({ ...formData, dairy_allergy: checked as boolean })}
              className="border-red-600 text-red-600 focus:ring-red-500"
            />
            <Label htmlFor="dairy_allergy" className="text-gray-300">
              Dairy Allergy
            </Label>
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 rounded-md transition-all duration-200 transform hover:scale-105"
          >
            {loading ? "Generating..." : "Get AI Recommendation"}
          </Button>
        </form>
      </div>
    </div>
  )
}

