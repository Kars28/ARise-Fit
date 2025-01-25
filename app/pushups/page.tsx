"use client";

import { useEffect, useRef, useState } from 'react';
import * as mpPose from '@mediapipe/pose';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Camera } from 'lucide-react';

export default function PushupCounter() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [reps, setReps] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [exercise, setExercise] = useState('pushup');
  let count = 0;
  let isLowered = false;

  useEffect(() => {
    const pose = new mpPose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults(onResults);

    const setupCamera = async () => {
      try {
        const video = videoRef.current;
        if (video && !video.srcObject) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play().catch((error) => console.error("Video play failed:", error));
            startPoseDetection();
          };
        }
      } catch (error) {
        console.error("Camera setup failed:", error);
      }
    };

    const startPoseDetection = async () => {
      if (videoRef.current) {
        await pose.send({ image: videoRef.current });
        requestAnimationFrame(startPoseDetection);
      }
    };

    setupCamera();

    return () => {
      pose.close();
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const onResults = (results) => {
    if (results.poseLandmarks) {
      drawPose(results.poseLandmarks);
      analyzePose(results.poseLandmarks);
    }
  };

  const drawPose = (landmarks) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;

    const bodyConnections = [
      [11, 13], [13, 15],
      [12, 14], [14, 16],
      [11, 12],
      [23, 25], [25, 27],
      [24, 26], [26, 28],
      [23, 24],
      [11, 23], [12, 24],
      [27, 29], [28, 30],
    ];

    bodyConnections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end) {
        const startX = start.x * canvas.width;
        const startY = start.y * canvas.height;
        const endX = end.x * canvas.width;
        const endY = end.y * canvas.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });

    ctx.fillStyle = 'blue';
    landmarks.forEach((landmark) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const analyzePose = (landmarks) => {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];

    if (leftShoulder && leftElbow && leftWrist) {
      const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      if (angle < 90 && !isLowered) {
        isLowered = true;
      }
      if (angle > 160 && isLowered) {
        count++;
        setReps(count);
        isLowered = false;
      }
    }
  };

  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * (180.0 / Math.PI));
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);

  const handleStop = () => setIsRunning(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <span className="text-red-500">AI</span> Workout Tracker
      </h1>

      <div className="relative w-[940px] h-[500px] bg-gray-800 mt-6 rounded-xl shadow-lg border border-gray-700 flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full rounded-xl" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
        <div className="absolute top-4 left-4">
          <Camera className="text-red-500 w-8 h-8" />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <Select onValueChange={(value) => setExercise(value)}>
          <SelectTrigger className="w-[180px] bg-white text-black rounded-md">
            <SelectValue placeholder="Pushup" />
          </SelectTrigger>
          
        </Select>

        <Button
          className="bg-red-500 hover:bg-red-600 flex items-center gap-2 text-white py-2 px-6 rounded-lg"
          onClick={handleStart}
        >
          ▶ Start
        </Button>

        <Button
          className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2 text-white py-2 px-6 rounded-lg"
          onClick={handleStop}
        >
          ⬛ Stop
        </Button>
      </div>

      <div className="flex gap-8 mt-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-[200px]">
          <h2 className="text-xl font-bold">Reps</h2>
          <p className="text-3xl font-bold">{reps}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-[200px]">
          <h2 className="text-xl font-bold">Time</h2>
          <p className="text-3xl font-bold">{formatTime(elapsedTime)}</p>
        </div>
      </div>
    </div>
  );
}
