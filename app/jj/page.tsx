"use client";
import { useEffect, useRef, useState } from "react";
import * as mpPose from "@mediapipe/pose";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Camera } from "lucide-react";

export default function WorkoutTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [reps, setReps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [exercise, setExercise] = useState("jumping jack");
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  let count = 0;
  let isJumping = false;

  useEffect(() => {
    if (!isTracking) return;

    const pose = new mpPose.Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
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
      const video = videoRef.current;
      if (video) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          video.srcObject = stream;
          video.onloadedmetadata = async () => {
            await video.play();
            sendToPose();
            startTimer();
          };
        } catch (err) {
          console.error("Error accessing camera:", err);
        }
      }
    };

    const sendToPose = async () => {
      if (videoRef.current) {
        await pose.send({ image: videoRef.current });
        requestAnimationFrame(sendToPose);
      }
    };

    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
      stopTimer();
    };
  }, [isTracking]);

  const onResults = (results) => {
    if (results.poseLandmarks) {
      drawPose(results.poseLandmarks);
      analyzePose(results.poseLandmarks);
    }
  };

  const drawPose = (landmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    landmarks.forEach((landmark) => {
      const x = landmark.x * canvas.width;
      const y = landmark.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "blue";
      ctx.fill();
    });
  };

  const analyzePose = (landmarks) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Detecting arms raised above head (for jumping jack)
    const armsAboveHead = (leftShoulder.y < leftElbow.y && rightShoulder.y < rightElbow.y);

    // Detecting legs apart (for jumping jack)
    const legsApart = (leftHip.x < leftKnee.x && rightHip.x > rightKnee.x);

    if (armsAboveHead && legsApart && !isJumping) {
      isJumping = true;
    }

    if (!armsAboveHead && !legsApart && isJumping) {
      count++;
      setReps(count);
      isJumping = false;
    }
  };

  const startTimer = () => {
    setElapsedTime(0);
    timerRef.current = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleStart = () => {
    setIsTracking(true);
  };

  const handleStop = () => {
    setIsTracking(false);
    setReps(0);
    stopTimer();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <span className="text-red-500">AI</span> Workout Tracker
      </h1>

      <div className="relative w-[940px] h-[500px] bg-black mt-6 rounded-xl shadow-lg border border-gray-700 flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full rounded-xl" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
        <div className="absolute top-4 left-4">
          <Camera className="text-red-500 w-8 h-8" />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <Select onValueChange={(value) => setExercise(value)}>
          <SelectTrigger className="w-[180px] bg-white text-black rounded-md">
            <SelectValue placeholder="Jumping Jack" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jumping jack">Jumping Jack</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="bg-red-500 hover:bg-red-600 flex items-center gap-2 text-white py-2 px-6 rounded-lg"
          onClick={handleStart}
        >
          ▶ Start
        </Button>

        <Button
          className="bg-black hover:bg-gray-700 flex items-center gap-2 text-white py-2 px-6 rounded-lg"
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
