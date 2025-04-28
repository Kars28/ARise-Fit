'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

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

export default function ARWorkoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get('exercise');
  const videoRef = useRef<HTMLVideoElement>(null);
  const scriptsLoadedCount = useRef(0);

  const handleScriptLoad = () => {
    scriptsLoadedCount.current += 1;
    if (scriptsLoadedCount.current === 3) {
      setIsScriptsLoaded(true);
    }
  };

  useEffect(() => {
    const initializeAR = async () => {
      try {
        // Check if exercise ID is provided
        if (!exerciseId) {
          throw new Error('No exercise selected');
        }

        // Wait for TensorFlow.js and pose detection to load
        if (!window.tf || !window.poseDetection) {
          throw new Error('Required libraries not loaded');
        }

        // Initialize AR workout
        if (!window.arWorkout) {
          throw new Error('AR workout script not loaded');
        }

        // Ensure video element is ready
        const video = videoRef.current;
        if (!video) {
          throw new Error('Video element not found');
        }

        // Wait for video to be ready
        if (video.readyState >= 3) {
          await window.arWorkout.init(exerciseId);
        } else {
          await new Promise<void>((resolve) => {
            const handleLoadedData = () => {
              video.removeEventListener('loadeddata', handleLoadedData);
              resolve();
            };
            video.addEventListener('loadeddata', handleLoadedData);
          });
          await window.arWorkout.init(exerciseId);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    };

    if (isScriptsLoaded && window.tf && window.poseDetection && window.arWorkout) {
      initializeAR();
    }

    // Cleanup function
    return () => {
      if (window.arWorkout) {
        window.arWorkout.stop();
      }
      const video = videoRef.current;
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }
    };
  }, [exerciseId, isScriptsLoaded]);

  if (!exerciseId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">No exercise selected</p>
          <Link href="/workout" className="text-blue-600 hover:underline">
            Go back to exercises
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0"
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.0.0"
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
      />
      <Script
        src="/ar-workout.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">AR Workout</h1>
            <Link 
              href="/workout"
              className="text-blue-600 hover:underline"
            >
              ← Back to exercises
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="relative">
            <video
              ref={videoRef}
              id="workout-video"
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
              playsInline
              muted
              autoPlay
            />
            <canvas
              id="workout-canvas"
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl"
            />
          </div>

          {isLoading && (
            <div className="flex justify-center items-center mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => window.arWorkout?.stop()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Workout
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 