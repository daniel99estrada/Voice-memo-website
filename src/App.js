import React, { useState } from 'react';
import { useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import AWS from 'aws-sdk';
import './App.css';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import saveAs from 'file-saver';


// Update with your AWS S3 bucket details
const AWS_ACCESS_KEY = 'AKIA5UD2B5HDXF5XQUMR';
const AWS_SECRET_ACCESS_KEY = 'TTQwITJriRqyhcdxjmMF78gbw4N7uSf0uUL2sSka';
const AWS_BUCKET_NAME = 'voice-memo-file-storage';
const AWS_REGION = 'us-east-1'

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const s3 = new AWS.S3();

const client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});


const App = () => {
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });
  const [submitted, setSubmitted] = useState(false);
  const [recordedAudioKey, setRecordedAudioKey] = useState('');
  const audioRef = useRef();

  const handleUpload = (blobURL) => {

    if (mediaBlobUrl) {
      const link = document.createElement('a');
      link.href = mediaBlobUrl;
      link.download = 'recorded_audio.wav';
      link.click();
    }

    if (!blobURL) {
      console.log('No recorded audio found.');
      return;
    }
  
    const file = new File([blobURL], 'recorded-audio.mp3', { type: 'audio/mp3' });
    saveAs(file, 'file/recorded-audio.mp3');

    return new Promise((resolve, reject) => {
      const params = {
        Bucket: AWS_BUCKET_NAME, // Replace with your S3 bucket name
        Key: `recorded-audio-${Date.now()}.wav`,
        Body: file,
        ContentType: 'audio/mpeg',
        ACL: 'public-read'
      };
    
      s3.upload(params, (err, data) => {
        if (err) {
          console.error('Failed to upload file:', err);
        } else {
          console.log('File uploaded successfully:', data.Location);
          setRecordedAudioKey(data.Key);
          setSubmitted(true);
        }
      })

    });
  };
  

  const handleRefresh = () => {
    window.location.reload(); // Refresh the page
  };
  
  return (
    <div className="container">
      <h1>STILLBLUE VOICE MEMOS</h1>
      {submitted ? (
        <>
          <p>Submission Received</p>
          <button onClick={handleRefresh}>Recording Again</button>
        </>
      ) : (
        <>
          {status === 'idle' && <button onClick={startRecording}>Start Recording</button>}
          {status === 'recording' && (
            <>
              <p className="recording">RECORDING</p>
              <button onClick={stopRecording}>Stop Recording</button>
            </>
          )}
          {mediaBlobUrl && (
          <div className="media-container">
            <audio src={mediaBlobUrl} controls />
            <button onClick={handleUpload}>Submit</button>
        </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;