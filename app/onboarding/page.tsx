'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    setStep(step + 1)
  }

  return (
    <div className="min-h-screen bg-black text-white py-6 px-4 sm:py-12">
      <div className="container mx-auto max-w-md sm:max-w-xl md:max-w-2xl">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl">Complete Your Profile</CardTitle>
            <CardDescription className="text-sm sm:text-base">Help us create your personalized fitness plan</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-sm sm:text-base">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        required
                        placeholder="175"
                        className="bg-zinc-800 border-zinc-700 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm sm:text-base">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        required
                        placeholder="70"
                        className="bg-zinc-800 border-zinc-700 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm sm:text-base">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      required
                      placeholder="25"
                      className="bg-zinc-800 border-zinc-700 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Gender</Label>
                    <Select>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-sm sm:text-base">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Fitness Goal</Label>
                    <Select>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-sm sm:text-base">
                        <SelectValue placeholder="Select your primary goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight-loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="general-fitness">General Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Activity Level</Label>
                    <Select>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-sm sm:text-base">
                        <SelectValue placeholder="Select your activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Lightly Active</SelectItem>
                        <SelectItem value="moderate">Moderately Active</SelectItem>
                        <SelectItem value="very">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical" className="text-sm sm:text-base">Medical Conditions</Label>
                    <Input
                      id="medical"
                      placeholder="List any medical conditions"
                      className="bg-zinc-800 border-zinc-700 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Upload Medical Reports (Optional)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      className="bg-zinc-800 border-zinc-700 text-sm sm:text-base"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full sm:w-auto order-2 sm:order-1"
                  >
                    Previous
                  </Button>
                )}
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto order-1 sm:order-2"
                >
                  {step === 2 ? 'Generate Plan' : 'Next'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

