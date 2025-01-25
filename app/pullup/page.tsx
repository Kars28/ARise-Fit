"use client";
import { useEffect, useRef, useState } from 'react';
import * as mpPose from '@mediapipe/pose';

export default function PullUpCounter() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [reps, setReps] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPullingUp, setIsPullingUp] = useState(false);
  let count = 0;
  let timerInterval;

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
      const video = videoRef.current;
      if (video) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          video.srcObject = stream;

          video.onloadeddata = () => video.play(); // Ensure video plays only after it's fully loaded
        } catch (err) {
          console.error("Error accessing the camera:", err);
        }
      }
    };

    setupCamera().then(() => {
      const sendToPose = async () => {
        if (videoRef.current) {
          await pose.send({ image: videoRef.current });
          requestAnimationFrame(sendToPose);
        }
      };
      sendToPose();
    });

    return () => {
      // Cleanup: stop video stream when the component unmounts
      const video = videoRef.current;
      if (video && video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }
    };
  }, []);

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

    // Draw the body posture lines
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;

    // Define connections between landmarks (key body parts to draw lines)
    const bodyConnections = [
      [11, 13], [13, 15], // Left shoulder to elbow to wrist
      [12, 14], [14, 16], // Right shoulder to elbow to wrist
      [11, 12], // Shoulders
      [23, 25], [25, 27], // Left hip to knee to ankle
      [24, 26], [26, 28], // Right hip to knee to ankle
      [23, 24], // Hips
      [11, 23], [12, 24], // Shoulders to hips
      [27, 29], [28, 30], // Left and right ankles to toes
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

    // Draw the landmarks (key points)
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
    const leftElbow = landmarks[13];
    const leftShoulder = landmarks[11];
    const rightElbow = landmarks[14];
    const rightShoulder = landmarks[12];

    if (leftElbow && leftShoulder && rightElbow && rightShoulder) {
      const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftShoulder);
      const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightShoulder);

      // During the pull-up, the arms should be almost straight (the angle will be small)
      if ((leftArmAngle < 45 || rightArmAngle < 45) && !isPullingUp) {
        setIsPullingUp(true);
      }

      // Once the person returns to the hanging position (bent elbow), count the rep
      if ((leftArmAngle > 90 || rightArmAngle > 90) && isPullingUp) {
        count++;
        setReps(count);
        setIsPullingUp(false);
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

  const startTimer = () => {
    setIsTimerRunning(true);
    timerInterval = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    clearInterval(timerInterval);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    clearInterval(timerInterval);
    setElapsedTime(0);
    setReps(0);
    count = 0;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <span className="text-red-500">AI</span> Pull-Up Counter
      </h1>

      <div className="relative w-[940px] h-[500px] bg-black mt-6 rounded-xl shadow-lg border border-gray-700 flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full rounded-xl" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>

      <div className="flex gap-8 mt-6">
        <div className="bg-black p-6 rounded-lg shadow-lg text-center w-[200px]">
          <h2 className="text-xl font-bold">Reps</h2>
          <p className="text-3xl font-bold">{reps}</p>
        </div>
        <div className="bg-black p-6 rounded-lg shadow-lg text-center w-[200px]">
          <h2 className="text-xl font-bold">Time</h2>
          <p className="text-3xl font-bold">{elapsedTime}s</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={startTimer}
          disabled={isTimerRunning}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Start Timer
        </button>
        <button
          onClick={stopTimer}
          disabled={!isTimerRunning}
          className="bg-black hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Stop Timer
        </button>
        <button
          onClick={resetTimer}
          className="bg-black hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
