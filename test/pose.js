const tf = require('@tensorflow/tfjs-node');
const poseDetection = require('@tensorflow-models/pose-detection');
const { createCanvas, loadImage } = require('canvas');
const axios = require('axios');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyAa6hB83viUHiIYurYEGHaGli-W9dTxaEs');

// Keypoint connections for drawing skeleton
const CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4], [5, 6], [5, 7],
  [7, 9], [6, 8], [8, 10], [5, 11], [6, 12], [11, 12],
  [11, 13], [13, 15], [12, 14], [14, 16]
];

async function downloadImage(url, filePath) {
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function drawSkeleton(ctx, keypoints) {
  // Draw keypoints
  keypoints.forEach(keypoint => {
    if (keypoint.score > 0.3) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
  });

  // Draw connections
  CONNECTIONS.forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];
    if (kp1.score > 0.3 && kp2.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

async function analyzeWithGemini(imagePath) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
  const imageData = fs.readFileSync(imagePath).toString('base64');
  
  const prompt = `Analyze this yoga pose. Identify the pose name, assess alignment accuracy, 
    provide improvement suggestions, and mention any potential injury risks. Keep response 
    concise with bullet points.`;

  const imagePart = { inlineData: { data: imageData, mimeType: 'image/jpeg' } };
  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}

async function processPose(s3Url) {
  const localPath = 'temp-image.jpg';
  const outputPath = 'pose-analysis.jpg';

  try {
    // Download image
    await downloadImage(s3Url, localPath);

    // Load image and detect pose
    const image = await loadImage(localPath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
    );

    const poses = await detector.estimatePoses(canvas);
    
    if (poses.length === 0) {
      throw new Error('No poses detected in the image');
    }

    // Draw skeleton on image
    drawSkeleton(ctx, poses[0].keypoints);

    // Save analyzed image
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createJPEGStream({ quality: 0.9 });
    stream.pipe(out);

    // Get Gemini analysis
    const analysis = await analyzeWithGemini(localPath);
    
    return {
      skeletonImage: outputPath,
      analysis: analysis
    };

  } finally {
    // Cleanup temporary file
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  }
}

// Usage
const s3Url = 'https://my-image-storage-bucket748383838838.s3.us-west-1.amazonaws.com/sampleImages/sample-image.jpg';

processPose(s3Url)
  .then(({ skeletonImage, analysis }) => {
    console.log('Analysis Results:');
    console.log(analysis);
    console.log(`Skeleton image saved to: ${skeletonImage}`);
  })
  .catch(err => console.error('Error:', err.message));


  // npm install @tensorflow/tfjs-node @tensorflow-models/pose-detection canvas axios @google/generative-ai

  // node poseAnalysis.js