import express from 'express';
import fs from 'fs';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs-node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';


// Ensure TensorFlow.js backend is registered
await tf.setBackend('tensorflow');
await tf.ready();

class ExerciseAnalyzer {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || 'AIzaSyAa6hB83viUHiIYurYEGHaGli-W9dTxaEs');
    this.poseDetector = null;
  }

  // BlazePose Keypoint Connections (Same as previous implementation)
  static BLAZEPOSE_CONNECTIONS = [
    // Face Connections
    [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6],
    
    // Upper Body Connections
    [11, 12], // Shoulders
    [11, 13], [13, 15], // Left Arm
    [12, 14], [14, 16], // Right Arm
    
    // Torso Connections
    [11, 23], [12, 24], // Shoulders to Hips
    [23, 24], // Hip Line
    
    // Lower Body Connections
    [23, 25], [25, 27], [27, 29], [27, 31], // Left Leg
    [24, 26], [26, 28], [28, 30], [28, 32], // Right Leg
    
    // Additional Connections
    [11, 12], // Shoulder Line
    [33, 0], // Body Center to Nose
    [34, 0]  // Forehead to Nose
  ];

  async downloadImage(imageUrl) {
    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  
    // Generate unique filename
    const filename = `temp-image-${Date.now()}.jpg`;
    const localFilePath = path.join(tempDir, filename);
  
    try {
      // Download image
      const response = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'arraybuffer'
      });
  
      // Write buffer directly to file
      fs.writeFileSync(localFilePath, response.data);
  
      return localFilePath;
    } catch (error) {
      console.error('Image download error:', error);
      throw error;
    }
  }

  async initializePoseDetector() {
    if (!this.poseDetector) {
      const model = poseDetection.SupportedModels.BlazePose;
      const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'full',
        enableSmoothing: true
      };
      this.poseDetector = await poseDetection.createDetector(model, detectorConfig);
    }
  }

  async detectPoseSkeleton(imagePath) {
    await this.initializePoseDetector();
  
    try {
      // Load the image using tf.node.decodeImage
      const imageBuffer = fs.readFileSync(imagePath);
      const tfImage = tf.node.decodeImage(imageBuffer, 3);
  
      // Resize image to a standard size for pose detection
      const resizedImage = tf.image.resizeBilinear(tfImage, [256, 256]);
  
      // Detect poses with BlazePose
      const poses = await this.poseDetector.estimatePoses(resizedImage, {
        maxPoses: 1,
        flipHorizontal: false
      });
  
      // Dispose of the tensors to prevent memory leaks
      tfImage.dispose();
      resizedImage.dispose();
  
      // Load the original image for canvas drawing
      const image = await loadImage(imagePath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
  
      // Draw the original image
      ctx.drawImage(image, 0, 0, image.width, image.height);
  
      // Prepare keypoint names for easy reference
      const keypointNames = [
        'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 
        'right_eye_inner', 'right_eye', 'right_eye_outer', 
        'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
        'left_shoulder', 'right_shoulder', 'left_elbow', 
        'right_elbow', 'left_wrist', 'right_wrist',
        'left_pinky', 'right_pinky', 'left_index', 'right_index',
        'left_thumb', 'right_thumb', 'left_hip', 'right_hip',
        'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
        'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index',
        'bodyCenter', 'forehead', 'leftThumb', 'leftHand', 
        'rightThumb', 'rightHand'
      ];
  
      // Draw skeleton lines
      poses.forEach(pose => {
        // Draw connections
        ExerciseAnalyzer.BLAZEPOSE_CONNECTIONS.forEach(([fromIndex, toIndex]) => {
          const fromKeypoint = pose.keypoints[fromIndex];
          const toKeypoint = pose.keypoints[toIndex];
  
          if (fromKeypoint && toKeypoint && fromKeypoint.score > 0.5 && toKeypoint.score > 0.5) {
            ctx.beginPath();
            ctx.moveTo(fromKeypoint.x, fromKeypoint.y);
            ctx.lineTo(toKeypoint.x, toKeypoint.y);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        });
  
        // Draw keypoints with confidence visualization
        pose.keypoints.forEach((keypoint, index) => {
          if (keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
            
            // Color intensity based on confidence
            ctx.fillStyle = `rgba(255, 0, 0, ${keypoint.score})`;
            ctx.fill();
  
            // Optional: Add keypoint labels
            ctx.fillStyle = 'blue';
            ctx.font = '8px Arial';
            ctx.fillText(keypointNames[index], keypoint.x + 5, keypoint.y + 5);
          }
        });
      });
  
      // Create skeleton directory if not exists
      const skeletonDir = path.join(process.cwd(), 'skeletons');
      if (!fs.existsSync(skeletonDir)) {
        fs.mkdirSync(skeletonDir);
      }
  
      // Save skeleton image
      const skeletonImagePath = path.join(skeletonDir, `blazepose-skeleton-${Date.now()}.png`);
      const out = fs.createWriteStream(skeletonImagePath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
  
      return new Promise((resolve, reject) => {
        out.on('finish', () => resolve(skeletonImagePath));
        out.on('error', reject);
      });
    } catch (error) {
      console.error('BlazePose Skeleton detection error:', error);
      return null;
    }
  } 

  async analyzeImage(imageUrl) {
    try {
      // Download image
      const localImagePath = await this.downloadImage(imageUrl);

      // Detect pose and generate skeleton
      const skeletonImage = await this.detectPoseSkeleton(localImagePath);

      // Clean up original downloaded image
      fs.unlinkSync(localImagePath);

      return {
        skeletonImagePath: skeletonImage
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }
}

// Express route handler
const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const analyzer = new ExerciseAnalyzer();
    const result = await analyzer.analyzeImage(imageUrl);
    res.json(result);
  } catch (error) {
    console.error('Full error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Backend:', tf.getBackend());
});

export default app;