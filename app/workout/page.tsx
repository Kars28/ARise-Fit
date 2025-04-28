"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Dumbbell, Camera, X, Loader2 } from 'lucide-react'
import Script from 'next/script'
import { Card } from '@/components/ui/card'
import WorkoutExercises from '@/components/workout-exercises'

// Declare global types
declare global {
  interface Window {
    tf?: any;
    poseDetection?: any;
    arWorkout?: {
      init: (exerciseId: string) => Promise<void>;
      stop: () => void;
    };
  }
}

type WorkoutType = 'strength' | 'yoga'

export default function WorkoutPage() {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null)
  const [isARReady, setIsARReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Cleanup function to stop AR when component unmounts
    return () => {
      if (window.arWorkout) {
        window.arWorkout.stop()
      }
    }
  }, [])

  const startARWorkout = (workoutType: WorkoutType) => {
    try {
      setError(null)
      setSelectedWorkout(workoutType)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select workout type')
      setSelectedWorkout(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="mr-2" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">
          AR Workout Experience
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!selectedWorkout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startARWorkout('strength')}>
              <h2 className="text-xl font-semibold mb-4">Strength Training</h2>
              <p className="text-gray-600">Get real-time feedback on your form during strength exercises</p>
            </Card>
            <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startARWorkout('yoga')}>
              <h2 className="text-xl font-semibold mb-4">Yoga</h2>
              <p className="text-gray-600">Perfect your yoga poses with AR guidance</p>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <WorkoutExercises type={selectedWorkout} />
          </div>
        )}
      </div>

      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.0.0/dist/pose-detection.js"
        strategy="beforeInteractive"
      />
      <Script
        src="/ar-workout.js"
        strategy="afterInteractive"
      />
    </div>
  )
}