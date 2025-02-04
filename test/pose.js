const tf = require("@tensorflow/tfjs-node");
const poseDetection = require("@tensorflow-models/pose-detection");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyAa6hB83viUHiIYurYEGHaGli-W9dTxaEs");

async function initializeTF() {
  await tf.setBackend('cpu');
  await tf.ready();
  await tf.enableProdMode();
}

// Updated connections for BlazePose (33 keypoints)
const CONNECTIONS = [
  // Face
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10], // Mouth
  // Upper Body
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  // Lower Body
  [11, 23],
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [12, 24],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  // Hands
  [15, 17],
  [17, 19],
  [19, 21],
  [15, 21],
  [16, 18],
  [18, 20],
  [20, 22],
  [16, 22],
  // Additional connections for better visualization
  [23, 24],
  [27, 28],
  [31, 32],
];
// Updated keypoint names for BlazePose (33 points)
const KEYPOINT_NAMES = [
  "nose", // 0
  "left_eye_inner", // 1
  "left_eye", // 2
  "left_eye_outer", // 3
  "right_eye_inner", // 4
  "right_eye", // 5
  "right_eye_outer", // 6
  "left_ear", // 7
  "right_ear", // 8
  "mouth_left", // 9
  "mouth_right", // 10
  "left_shoulder", // 11
  "right_shoulder", // 12
  "left_elbow", // 13
  "right_elbow", // 14
  "left_wrist", // 15
  "right_wrist", // 16
  "left_pinky", // 17
  "right_pinky", // 18
  "left_index", // 19
  "right_index", // 20
  "left_thumb", // 21
  "right_thumb", // 22
  "left_hip", // 23
  "right_hip", // 24
  "left_knee", // 25
  "right_knee", // 26
  "left_ankle", // 27
  "right_ankle", // 28
  "left_heel", // 29
  "right_heel", // 30
  "left_foot_index", // 31
  "right_foot_index", // 32
];

async function downloadImage(url, filePath) {
  const response = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function drawSkeleton(ctx, keypoints) {
  // Draw keypoints
  keypoints.forEach((keypoint, i) => {
    if (keypoint && keypoint.score > 0.3) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = i < 11 ? "blue" : "red"; // Different colors for face/body
      ctx.fill();
    }
  });

  // Draw connections
  CONNECTIONS.forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];
    if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

async function analyzeWithGemini(poseDescription) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Analyze this physical pose biomechanical data (BlazePose 33 keypoints):
  
  ${poseDescription}

  Follow these steps:
  1. Identify primary joints with >30° flexion/extension
  2. Check for bilateral symmetry
  3. Assess weight distribution indicators
  4. Compare against common exercise/yoga patterns
  5. Analyze hand/foot positions

  Format response:
  - Activity: [Name] 
  - Type: [Yoga/Exercise/Stretching/Sports]
  - Confidence: [1-100]
  - Key Biomarkers: 
    • [Joint1]: [Angle]°
    • [Joint2]: [Angle]°
  - Form Tips: 
    • [Tip1]
    • [Tip2]
  - Safety Check: [OK/Caution/Warning]
  - Balance Assessment: [Good/Fair/Poor]`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error analyzing with Gemini:", error);
    return "Analysis failed: " + error.message;
  }
}

async function processPose(s3Url) {
  await initializeTF();
  const localPath = "temp-image.jpg";
  const outputPath = "pose-analysis.jpg";

  try {
    await downloadImage(s3Url, localPath);
    const image = await loadImage(localPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    // Use BlazePose detector with improved configuration
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.BlazePose,
      {
        runtime: 'tfjs',
        modelType: 'full',
        enableSmoothing: true,
        maxPoses: 1,
        scoreThreshold: 0.3,
        backend: 'cpu' 
      }
    );

    const poses = await detector.estimatePoses(canvas);
    if (!poses || poses.length === 0) throw new Error("No poses detected");

    // Draw enhanced skeleton
    drawSkeleton(ctx, poses[0].keypoints);

    // Save analyzed image
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createJPEGStream({ quality: 0.95 });
    stream.pipe(out);

    // Enhanced pose description with 3D data
    const poseDescription = poses[0].keypoints
      .map((kp, index) => {
        const zCoord = kp.z ? `, z: ${kp.z.toFixed(2)}` : "";
        return `${KEYPOINT_NAMES[index]}: (${kp.x.toFixed(2)}, ${kp.y.toFixed(
          2
        )}${zCoord}) score: ${kp.score.toFixed(2)}`;
      })
      .join("\n");

    const analysis = await analyzeWithGemini(poseDescription);

    return {
      skeletonImage: outputPath,
      analysis: analysis,
      poseDescription: poseDescription,
    };
  } catch (error) {
    console.error("Error in processPose:", error);
    throw error;
  } finally {
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    tf.engine().disposeVariables();
  }
}

const s3Url =
  "https://my-image-storage-bucket748383838838.s3.us-west-1.amazonaws.com/sampleImages/sample-image.jpg";
processPose(s3Url)
  .then((result) => {
    console.log("Pose Description:", result.poseDescription);
    console.log("Analysis:", result.analysis);
    console.log("Skeleton image saved to:", result.skeletonImage);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
