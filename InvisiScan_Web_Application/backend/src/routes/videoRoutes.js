const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Accept location from either body or query (multer parses body after file, so use a workaround)
    let location = req.body.location || 'Unknown';
    // Remove unsafe characters from folder name
    location = location.replace(/[^a-zA-Z0-9-_]/g, '_');
    const dir = path.join('uploads', location);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/video/upload
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded.' });
    }
    // Full path to the uploaded file
    const videoPath = path.resolve('uploads', req.file.filename);
    // Example dummy metadata; replace with real values if available from frontend
    const oversampledCrop = '10_crop';
    const location = 'Unknown';
    const anomalyDate = new Date().toISOString().slice(0, 10);
    const anomalyTime = new Date().toISOString().slice(11, 19);
    const coordinates = '0,0';

    // Prepare form data for CCTV Analysis
    const formCCTV = new FormData();
    formCCTV.append('video', fs.createReadStream(videoPath), req.file.originalname);
    formCCTV.append('oversampledCrop', oversampledCrop);
    formCCTV.append('location', location);
    formCCTV.append('anomalyDate', anomalyDate);
    formCCTV.append('anomalyTime', anomalyTime);
    formCCTV.append('coordinates', coordinates);

    // Prepare form data for Crime Detection
    const formCrime = new FormData();
    formCrime.append('video', fs.createReadStream(videoPath), req.file.originalname);
    formCrime.append('oversampledCrop', oversampledCrop);
    formCrime.append('location', location);
    formCrime.append('anomalyDate', anomalyDate);
    formCrime.append('anomalyTime', anomalyTime);
    formCrime.append('coordinates', coordinates);

    // Call CCTV Analysis service
    let cctvResult = null;
    try {
      const cctvResponse = await axios.post('http://localhost:5010/analyze', formCCTV, {
        headers: formCCTV.getHeaders(),
        maxBodyLength: Infinity,
      });
      cctvResult = cctvResponse.data;
    } catch (err) {
      console.error('CCTV Analysis service error:', err.message);
      cctvResult = { error: err.message };
    }

    // Call Crime Detection service
    let crimeResult = null;
    try {
      const crimeResponse = await axios.post('http://localhost:5005/analyze', formCrime, {
        headers: formCrime.getHeaders(),
        maxBodyLength: Infinity,
      });
      crimeResult = crimeResponse.data;
    } catch (err) {
      console.error('Crime Detection service error:', err.message);
      crimeResult = { error: err.message };
    }

    // Optionally delete the uploaded file after processing
    fs.unlink(videoPath, (err) => {
      if (err) console.error('Failed to delete uploaded file:', err);
    });

    res.json({
      message: 'Video uploaded and analyzed.',
      cctvAnalysis: cctvResult,
      crimeDetection: crimeResult
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process video.' });
  }
});

module.exports = router;
