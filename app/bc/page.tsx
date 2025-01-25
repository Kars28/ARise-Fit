"use client";
import { useEffect, useRef, useState } from 'react';
import * as mpPose from '@mediapipe/pose';

export default function PoseEstimation() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [reps, setReps] = useState(0);
  let count = 0;
  let isCurling = false;

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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
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
      // Cleanup MediaStream
      const video = videoRef.current;
      if (video && video.srcObject) {
        const stream = video.srcObject;
        stream.getTracks().forEach((track) => track.stop());
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
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    for (let i = 0; i < landmarks.length; i++) {
      const x = landmarks[i].x * canvas.width;
      const y = landmarks[i].y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'blue';
      ctx.fill();
    }

    // Draw connections
    const connections = mpPose.POSE_CONNECTIONS;
    connections.forEach(([start, end]) => {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }
    });
  };

  const analyzePose = (landmarks) => {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];

    if (leftShoulder && leftElbow && leftWrist) {
      const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      if (angle < 50 && !isCurling) {
        isCurling = true;
      }
      if (angle > 140 && isCurling) {
        count++;
        setReps(count);
        isCurling = false;
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <span className="text-red-500">AI</span> Bicep Curl Counter
      </h1>

      <div className="relative w-[940px] h-[500px] bg-black mt-6 rounded-xl shadow-lg border border-gray-700 flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full rounded-xl" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>

      <div className="flex gap-8 mt-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-[200px]">
          <h2 className="text-xl font-bold">Reps</h2>
          <p className="text-3xl font-bold">{reps}</p>
        </div>
      </div>
    </div>
  );
}
