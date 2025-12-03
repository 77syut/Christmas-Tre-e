import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onGesture: (isOpen: boolean) => void;
  isEnabled: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onGesture, isEnabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    if (!isEnabled) return;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        recognizerRef.current = recognizer;
        setIsLoaded(true);
        startCamera();
      } catch (error) {
        console.error("Failed to load MediaPipe:", error);
      }
    };

    init();

    return () => {
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isEnabled]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestRef.current = requestAnimationFrame(predict);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const predict = () => {
    const video = videoRef.current;
    const recognizer = recognizerRef.current;

    if (video && recognizer && isLoaded) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        
        try {
            const results = recognizer.recognizeForVideo(video, Date.now());
            if (results.gestures.length > 0) {
            const category = results.gestures[0][0].categoryName;
            // Map gestures to Open/Close
            // "Open_Palm" -> Scatter (true)
            // "Closed_Fist" -> Gather (false)
            if (category === "Open_Palm") {
                onGesture(true);
            } else if (category === "Closed_Fist") {
                onGesture(false);
            }
            }
        } catch(e) {
            // Ignore temporary recognition errors
        }
      }
    }
    requestRef.current = requestAnimationFrame(predict);
  };

  if (!isEnabled) return null;

  return (
    <div className="absolute bottom-4 right-4 w-32 h-24 border-2 border-emerald-500 rounded-lg overflow-hidden z-50 opacity-80 shadow-[0_0_15px_rgba(0,255,100,0.5)]">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
        muted 
        playsInline 
      />
      {!isLoaded && <div className="absolute inset-0 flex items-center justify-center text-xs text-white bg-black/50">Loading AI...</div>}
    </div>
  );
};

export default HandTracker;
