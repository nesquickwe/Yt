const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Create necessary directories
const createDirectories = () => {
  const templatesDir = path.join(__dirname, 'templates');
  const songsDir = path.join(__dirname, 'songs');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir);
  }
  if (!fs.existsSync(songsDir)) {
    fs.mkdirSync(songsDir);
  }
};

// Function to download media from YouTube
const downloadYouTube = (url, format = 'mp3') => {
  const outputDir = path.join(__dirname, 'songs');
  let command;
  if (format === 'mp3') {
    command = `youtube-dl --extract-audio --audio-format mp3 --output "${outputDir}/%(title)s.%(ext)s" ${url}`;
  } else if (format === 'mp4') {
    command = `youtube-dl --output "${outputDir}/%(title)s.%(ext)s" ${url}`;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error downloading YouTube video: ${error}`);
      return;
    }
    console.log(`Download complete: ${stdout}`);
  });
};

// Function to download media from TikTok without watermark
const downloadTikTok = (url) => {
  const outputDir = path.join(__dirname, 'songs');
  const command = `youtube-dl --output "${outputDir}/%(title)s.%(ext)s" ${url}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error downloading TikTok video: ${error}`);
      return;
    }
    console.log(`Download complete: ${stdout}`);
  });
};

// Home page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Route to handle media download (YouTube and TikTok)
app.post('/download', express.urlencoded({ extended: true }), (req, res) => {
  const { url, format } = req.body;
  if (!url) {
    return res.send('Please provide a valid URL.');
  }

  if (url.includes('tiktok.com')) {
    downloadTikTok(url);
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    downloadYouTube(url, format);
  } else {
    return res.send('Unsupported URL.');
  }

  res.send('Download initiated. Check console for details.');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  createDirectories();
});
