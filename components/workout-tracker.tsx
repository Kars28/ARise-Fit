"use client"

import React, { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import axios from "axios"
import { Activity, Play, Square, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

const exercises = [
  { value: "squat", label: "Squat" },
  { value: "pushup", label: "Push-up" },
  { value: "situp", label: "Sit-up" },
  { value: "bicepcurl", label: "Bicep Curl" },
]

export default function WorkoutTracker() {
  const webcamRef = useRef(null)
  const [exercise, setExercise] = useState("squat")
  const [feedback, setFeedback] = useState("")
  const [reps, setReps] = useState(0)
  const [correctPosture, setCorrectPosture] = useState(true)
  const [stage, setStage] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const [stopTime, setStopTime] = useState(null)

  const captureFrame = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      return imageSrc?.split(",")[1]
    }
    return null
  }

  const sendFrame = async () => {
    if (!isTracking) return

    const frame = captureFrame()
    if (!frame) return

    try {
      const response = await axios.post("http://127.0.0.1:5000/workout", {
        exercise,
        frame,
        stage,
      })

      const data = response.data

      if (data.error) {
        setFeedback(data.error)
        return
      }

      setReps((prevReps) => prevReps + data.reps)
      setFeedback(data.feedback)
      setCorrectPosture(data.correct_posture)
      setStage(data.stage)
    } catch (error) {
      console.error("Error sending frame:", error)
      setFeedback("Error communicating with the server.")
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      sendFrame()
    }, 500) // Send every 500ms
    return () => clearInterval(interval)
  }, [isTracking, stage, exercise])

  const handleStart = () => {
    setStartTime(new Date().toISOString())
    setIsTracking(true)
    setReps(0) // Reset reps at the start
    setFeedback("")
  }

  const handleStop = () => {
    setStopTime(new Date().toISOString())
    setIsTracking(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Card className="max-w-4xl mx-auto bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-red-500" />
            AI Workout Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user",
              }}
              className="w-full rounded-lg border-2 border-zinc-700"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 p-2 rounded">
              <Camera className="h-6 w-6 text-red-500" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Select value={exercise} onValueChange={setExercise} disabled={isTracking}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((ex) => (
                  <SelectItem key={ex.value} value={ex.value}>
                    {ex.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-x-2">
              <Button onClick={handleStart} disabled={isTracking} variant="destructive" size="lg">
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
              <Button onClick={handleStop} disabled={!isTracking} variant="outline" size="lg">
                <Square className="mr-2 h-4 w-4" /> Stop
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle>Reps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{reps}</div>
                <Progress value={(reps / 20) * 100} className="mt-2" />
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle>Posture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${correctPosture ? "text-green-500" : "text-red-500"}`}>
                  {correctPosture ? "Correct" : "Incorrect"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-800 border-zinc-700">
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{feedback || "No feedback yet"}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400">
            <div>Start Time: {startTime || "Not started"}</div>
            <div>Stop Time: {stopTime || "Not stopped"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

