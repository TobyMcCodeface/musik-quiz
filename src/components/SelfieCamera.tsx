"use client";

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Camera, RefreshCw } from 'lucide-react';

interface SelfieCameraProps {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
}

const SelfieCamera = ({ onCapture, onClose }: SelfieCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [photoTaken, setPhotoTaken] = useState(false);

  // Starta kameran
  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: { ideal: 512 }, height: { ideal: 512 } } 
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Kunde inte få åtkomst till kameran:', err);
        setError('Kunde inte få åtkomst till kameran. Kontrollera att du har gett behörighet.');
      }
    }

    setupCamera();

    // Städa upp när komponenten avmonteras
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Ta en bild från kameraströmmen
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Sätt canvas storlek
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Vänd bilden horisontellt för selfie
      context?.translate(canvas.width, 0);
      context?.scale(-1, 1);
      
      // Rita video frame till canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Skala ner och konvertera till data URL
      const avatarSize = 256;
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = avatarSize;
      smallCanvas.height = avatarSize;
      
      const smallContext = smallCanvas.getContext('2d');
      smallContext?.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, avatarSize, avatarSize);
      
      // Konvertera till JPEG data URL med komprimering
      const imageUrl = smallCanvas.toDataURL('image/jpeg', 0.7);
      
      setPhotoTaken(true);
      onCapture(imageUrl);
    }
  };

  // Ta om bilden
  const retakePhoto = () => {
    setPhotoTaken(false);
  };

  // Stäng kameran
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleClose}
    >
      <motion.div 
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-lg p-4 max-w-md w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Ta en selfie</h3>
          <Button variant="ghost" size="sm" onClick={handleClose}>✕</Button>
        </div>

        {error ? (
          <div className="text-red-500 p-4 text-center">{error}</div>
        ) : (
          <div className="relative overflow-hidden rounded-lg">
            <div className={`relative ${photoTaken ? 'hidden' : 'block'}`}>
              <video
                ref={videoRef}
                className="w-full rounded-lg transform scale-x-[-1]"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute inset-0 border-4 border-dashed border-white/30 rounded-lg pointer-events-none" />
            </div>
            
            <canvas 
              ref={canvasRef} 
              className={`w-full rounded-lg ${photoTaken ? 'block' : 'hidden'}`} 
            />
          </div>
        )}

        <div className="flex justify-center mt-4 space-x-2">
          {!photoTaken ? (
            <Button onClick={takePhoto} className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Ta bild
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={retakePhoto} className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Ta ny bild
              </Button>
              <Button onClick={handleClose}>Använd bild</Button>
            </>
          )}
        </div>
        
        <p className="text-xs text-gray-500 mt-3 text-center">
          Placera ditt ansikte i mitten av ramen och klicka på "Ta bild"
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SelfieCamera;