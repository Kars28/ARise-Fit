"use client"
import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

export default function PoseEstimation() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [reps, setReps] = useState(0);
  let count = 0;
  let isCurling = false;

  useEffect(() => {
    const runPoseEstimation = async () => {
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        {
          runtime: 'tfjs',
          modelType: 'full'
        }
      );

      const detect = async () => {
        if (videoRef.current) {
          const poses = await detector.estimatePoses(videoRef.current);
          if (poses.length > 0) {
            analyzePose(poses[0]);
          }
          requestAnimationFrame(detect);
        }
      };
      detect();
    };

    const setupCamera = async () => {
      const video = videoRef.current;
      if (video) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
      }
    };

    setupCamera().then(runPoseEstimation);
  }, []);

  const analyzePose = (pose) => {
    const keypoints = pose.keypoints;
    const leftShoulder = keypoints.find(point => point.name === 'left_shoulder');
    const leftElbow = keypoints.find(point => point.name === 'left_elbow');
    const leftWrist = keypoints.find(point => point.name === 'left_wrist');

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
    <div>
      <h1>Bicep Curl Counter: {reps}</h1>
      <video ref={videoRef} style={{ display: 'block', width: '640px', height: '480px' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
}