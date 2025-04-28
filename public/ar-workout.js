// Exercise configurations
const exerciseConfigs = {
    squats: {
        keypoints: ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle'],
        minAngle: 90,
        maxAngle: 180,
        targetReps: 10
    },
    pushups: {
        keypoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
        minAngle: 90,
        maxAngle: 180,
        targetReps: 10
    },
    bicepcurls: {
        keypoints: ['left_shoulder', 'left_elbow', 'left_wrist', 'right_shoulder', 'right_elbow', 'right_wrist'],
        minAngle: 30,
        maxAngle: 160,
        targetReps: 10
    }
};

// Global variables
let video;
let canvas;
let ctx;
let detector;
let currentExercise;
let repCount = 0;
let isInitialized = false;

// Initialize AR workout
async function init(exerciseId) {
    try {
        if (!exerciseId || !exerciseConfigs[exerciseId]) {
            throw new Error('Invalid exercise selected');
        }

        currentExercise = exerciseConfigs[exerciseId];
        
        // Initialize video and canvas
        video = document.getElementById('workout-video');
        canvas = document.getElementById('workout-canvas');
        ctx = canvas.getContext('2d');

        // Set up video stream
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        });
        video.srcObject = stream;
        video.play();

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Initialize pose detector
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER
            }
        );

        isInitialized = true;
        detectPose();
    } catch (error) {
        console.error('Error initializing AR workout:', error);
        throw error;
    }
}

// Main pose detection loop
async function detectPose() {
    if (!isInitialized) return;

    try {
        const poses = await detector.estimatePoses(video);
        drawPose(poses[0]);
        requestAnimationFrame(detectPose);
    } catch (error) {
        console.error('Error detecting pose:', error);
    }
}

// Draw pose on canvas
function drawPose(pose) {
    if (!pose) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw keypoints
    pose.keypoints.forEach(keypoint => {
        if (keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
        }
    });

    // Draw skeleton
    const adjacentKeyPoints = poseDetection.util.getAdjacentKeyPoints(
        pose.keypoints,
        0.5
    );
    adjacentKeyPoints.forEach(keypoints => {
        ctx.beginPath();
        ctx.moveTo(keypoints[0].x, keypoints[0].y);
        ctx.lineTo(keypoints[1].x, keypoints[1].y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'green';
        ctx.stroke();
    });

    // Calculate angles and check form
    checkForm(pose);
}

// Check exercise form and count reps
function checkForm(pose) {
    const keypoints = pose.keypoints;
    const config = currentExercise;

    // Get relevant keypoints
    const points = config.keypoints.map(name => 
        keypoints.find(kp => kp.part === name)
    );

    // Calculate angles
    const angles = calculateAngles(points);

    // Check if angles are within range
    const isValidForm = angles.every(angle => 
        angle >= config.minAngle && angle <= config.maxAngle
    );

    // Update rep count
    if (isValidForm) {
        repCount++;
        console.log(`Rep ${repCount}/${config.targetReps}`);
    }
}

// Calculate angles between keypoints
function calculateAngles(points) {
    const angles = [];
    for (let i = 0; i < points.length - 2; i += 3) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2];

        if (p1 && p2 && p3) {
            const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                         Math.atan2(p1.y - p2.y, p1.x - p2.x);
            angles.push(Math.abs(angle * 180 / Math.PI));
        }
    }
    return angles;
}

// Stop AR workout
function stop() {
    isInitialized = false;
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    if (detector) {
        detector.dispose();
    }
}

// Export functions to window object
window.arWorkout = {
    init,
    stop
}; 