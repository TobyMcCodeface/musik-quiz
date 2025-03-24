"use client";

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Camera, RefreshCw, Sparkles, Music, Headphones, TrendingUp } from 'lucide-react';

interface SelfieCameraProps {
  onCapture: (imageUrl: string) => void;
  onClose: () => void;
}

// Definiera effekter
const effects = [
  { id: 'none', name: 'Ingen', icon: <Camera className="h-4 w-4" /> },
  { id: 'sunglasses', name: 'Glasögon', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'hat', name: 'Hatt', icon: <Music className="h-4 w-4" /> },
  { id: 'headphones', name: 'Hörlurar', icon: <Headphones className="h-4 w-4" /> },
  { id: 'glitter', name: 'Glitter', icon: <Sparkles className="h-4 w-4" /> },
];

// SVG-bilder för effekterna (förenklade för bättre prestanda)
const effectImages = {
  sunglasses: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20'%3E%3Cpath fill='%23000' d='M15,10c-5,0-10,4-10,8h10c5,0,10-4,10-8h-5H15z M85,10c-5,0-10,4-10,8h10c5,0,10-4,10-8h-5H85z M30,10h40v2H30z'/%3E%3C/svg%3E",
  
  hat: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Cpath fill='%23D32F2F' d='M95,35c0,0-45-15-90,0c2.5-20,20-25,45-25S92.5,15,95,35z'/%3E%3Cpath fill='%23B71C1C' d='M5,35c0,0,45,10,90,0H5z'/%3E%3C/svg%3E",
  
  headphones: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%23212121' d='M15,45c0,0,0-25,35-25s35,25,35,25h-10c0,0-5-15-25-15S25,45,15,45z M15,45v30c0,3,2,5,5,5h10V45H15z M80,45v30c0,3-2,5-5,5H65V45H80z'/%3E%3C/svg%3E",
  
  glitter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cstyle%3E.sparkle %7B fill: %23FFD700; %7D%3C/style%3E%3Cg%3E%3Cpath class='sparkle' d='M20,20l5,15l-5,15l15-5l15,5l-5-15l5-15l-15,5L20,20z'/%3E%3Cpath class='sparkle' d='M60,60l3,9l-3,9l9-3l9,3l-3-9l3-9l-9,3L60,60z'/%3E%3Cpath class='sparkle' d='M65,25l2,6l-2,6l6-2l6,2l-2-6l2-6l-6,2L65,25z'/%3E%3Cpath class='sparkle' d='M25,65l2,6l-2,6l6-2l6,2l-2-6l2-6l-6,2L25,65z'/%3E%3C/g%3E%3C/svg%3E",
};

const SelfieCameraWithEffects = ({ onCapture, onClose }: SelfieCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [effectImg, setEffectImg] = useState<HTMLImageElement | null>(null);

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

  // Ladda effektbild när effekt väljs
  useEffect(() => {
    if (selectedEffect !== 'none') {
      const img = new Image();
      img.src = effectImages[selectedEffect as keyof typeof effectImages];
      img.onload = () => {
        setEffectImg(img);
        console.log("Effektbild laddad:", selectedEffect);
      };
    } else {
      setEffectImg(null);
    }
  }, [selectedEffect]);

  // Rendera effekten på overlay canvas
  useEffect(() => {
    const renderEffect = () => {
      // Se till att vi har video och canvas referenser
      if (!videoRef.current || !overlayCanvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      // Ställ in canvas-storlek för att matcha video
      if (video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      } else {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      
      // Om vi har tagit ett foto eller inte har en effekt, avsluta tidigt
      if (photoTaken || selectedEffect === 'none') {
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      
      // Rensa canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Om vi har en effektbild, rita den
      if (effectImg) {
        // Rita effekten baserat på typ
        if (selectedEffect === 'sunglasses') {
          // Placera glasögon i ansiktshöjd
          context.drawImage(effectImg, canvas.width * 0.2, canvas.height * 0.35, canvas.width * 0.6, canvas.height * 0.1);
        } else if (selectedEffect === 'hat') {
          // Placera hatt högst upp
          context.drawImage(effectImg, canvas.width * 0.1, canvas.height * 0.05, canvas.width * 0.8, canvas.height * 0.2);
        } else if (selectedEffect === 'headphones') {
          // Placera hörlurar runt huvudet
          context.drawImage(effectImg, canvas.width * 0.15, canvas.height * 0.2, canvas.width * 0.7, canvas.height * 0.3);
        } else if (selectedEffect === 'glitter') {
          // Glitter över hela bilden
          context.drawImage(effectImg, 0, 0, canvas.width, canvas.height);
          context.drawImage(effectImg, canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.4, canvas.height * 0.4);
          context.drawImage(effectImg, canvas.width * 0.1, canvas.height * 0.7, canvas.width * 0.3, canvas.height * 0.3);
          context.drawImage(effectImg, canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.25, canvas.height * 0.25);
        }
      }
      
      // Fortsätt uppdatera med animations-frame
      animationId = requestAnimationFrame(renderEffect);
    };
    
    let animationId: number;
    // Starta animations-loop
    animationId = requestAnimationFrame(renderEffect);
    
    // Städa upp när effekt ändras
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [selectedEffect, effectImg, photoTaken]);

  // Ta en bild från kameraströmmen med effekt
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current && overlayCanvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;
      
      // Sätt canvas storlek
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Vänd bilden horisontellt för selfie
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      
      // Rita video frame till canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Om en effekt är vald, rita överläggscanvas ovanpå
      if (selectedEffect !== 'none' && effectImg) {
        context.setTransform(1, 0, 0, 1, 0, 0); // Återställ transformationen
        
        // Rita effekten baserat på typ
        if (selectedEffect === 'sunglasses') {
          context.drawImage(effectImg, canvas.width * 0.2, canvas.height * 0.35, canvas.width * 0.6, canvas.height * 0.1);
        } else if (selectedEffect === 'hat') {
          context.drawImage(effectImg, canvas.width * 0.1, canvas.height * 0.05, canvas.width * 0.8, canvas.height * 0.15);
        } else if (selectedEffect === 'headphones') {
          context.drawImage(effectImg, canvas.width * 0.15, canvas.height * 0.2, canvas.width * 0.7, canvas.height * 0.3);
        } else if (selectedEffect === 'glitter') {
          context.drawImage(effectImg, 0, 0, canvas.width, canvas.height);
          context.drawImage(effectImg, canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.4, canvas.height * 0.4);
          context.drawImage(effectImg, canvas.width * 0.1, canvas.height * 0.7, canvas.width * 0.3, canvas.height * 0.3);
          context.drawImage(effectImg, canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.25, canvas.height * 0.25);
        }
      }
      
      // Skala ner och konvertera till data URL
      const avatarSize = 256;
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = avatarSize;
      smallCanvas.height = avatarSize;
      
      const smallContext = smallCanvas.getContext('2d');
      if (smallContext) {
        smallContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, avatarSize, avatarSize);
        
        // Konvertera till JPEG data URL med komprimering
        const imageUrl = smallCanvas.toDataURL('image/jpeg', 0.7);
        
        setPhotoTaken(true);
        onCapture(imageUrl);
      }
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
                onCanPlay={(e) => {
                  const video = e.target as HTMLVideoElement;
                  if (overlayCanvasRef.current) {
                    overlayCanvasRef.current.width = video.videoWidth || 640;
                    overlayCanvasRef.current.height = video.videoHeight || 480;
                  }
                }}
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
                style={{ transform: 'scaleX(-1)' }} // Spegla canvas också
              />
              <div className="absolute inset-0 border-4 border-dashed border-white/30 rounded-lg pointer-events-none" />
            </div>
            
            <canvas 
              ref={canvasRef} 
              className={`w-full rounded-lg ${photoTaken ? 'block' : 'hidden'}`} 
            />
          </div>
        )}

        {!photoTaken && (
          <div className="mt-4 mb-4">
            <p className="text-sm font-medium mb-2">Välj en effekt</p>
            <div className="flex justify-between gap-1 overflow-x-auto pb-2">
              {effects.map((effect) => (
                <Button
                  key={effect.id}
                  variant={selectedEffect === effect.id ? "default" : "outline"}
                  className="flex flex-col items-center px-2 py-1 h-auto min-w-[60px]"
                  onClick={() => setSelectedEffect(effect.id)}
                >
                  <div className="mb-1">{effect.icon}</div>
                  <span className="text-xs whitespace-nowrap">{effect.name}</span>
                </Button>
              ))}
            </div>
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

export default SelfieCameraWithEffects;