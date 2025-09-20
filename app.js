const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/merge-audio', upload.array('audio', 3), (req, res) => {
  const files = req.files;
  if (!files || files.length !== 3) {
    return res.status(400).json({ error: 'Need exactly 3 audio files' });
  }

  const outputPath = `merged-${Date.now()}.mp3`;
  
  ffmpeg()
    .input(files[0].path)
    .input(files[1].path)
    .input(files[2].path)
    .complexFilter('[0:0][1:0][2:0]concat=n=3:v=0:a=1[out]')
    .outputOptions('-map [out]')
    .save(outputPath)
    .on('end', () => {
      res.download(outputPath, () => {
        // Cleanup
        files.forEach(f => fs.unlinkSync(f.path));
        fs.unlinkSync(outputPath);
      });
    })
    .on('error', (err) => {
      res.status(500).json({ error: err.message });
    });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Audio merger running');
});
