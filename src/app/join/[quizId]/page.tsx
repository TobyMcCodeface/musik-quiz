"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import SelfieCamera from "@/components/SelfieCamera";
import MusicInterestSelector from "@/components/MusicInterestSelector";

// Define avatar styles
const avatarStyles = [
  { style: "lorelei", title: "Person" },
  { style: "bottts", title: "Robot" },
  { style: "adventurer", title: "Äventyrare" }
];

export default function JoinQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  
  const [quizName, setQuizName] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");
  const [birthYear, setBirthYear] = useState<string>("1985");
  const [musicInterests, setMusicInterests] = useState<string[]>([]);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState(0);
  const [selectedSeed, setSelectedSeed] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [isSelfie, setIsSelfie] = useState<boolean>(false);

  // Generate avatar seeds
  const avatarSeeds = Array.from({ length: 5 }, (_, i) => i + 1);

  // Generate avatar URL based on selected style and seed
  useEffect(() => {
    // Om det är en selfie, behåll den bilden
    if (isSelfie) return;
    
    const seed = `seed-${selectedSeed}`;
    const style = avatarStyles[selectedAvatarStyle].style;
    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    setAvatarUrl(url);
  }, [selectedAvatarStyle, selectedSeed, isSelfie]);

  // Hantera selfie-fångst
  const handleCaptureImage = (imageUrl: string) => {
    setAvatarUrl(imageUrl);
    setIsSelfie(true);
  };

  // Check for existing player in localStorage
  useEffect(() => {
    const existingPlayer = localStorage.getItem(`quiz_${quizId}_player`);
    
    if (existingPlayer) {
      const player = JSON.parse(existingPlayer);
      router.push(`/lobby/${quizId}?playerId=${player.id}`);
    }
  }, [quizId, router]);
  
  // Fetch quiz data
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizDoc = await getDoc(doc(db, "quizzes", quizId));
        
        if (quizDoc.exists()) {
          setQuizName(quizDoc.data().name);
        } else {
          setError("Quiz hittades inte");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching quiz: ", error);
        setError("Fel vid laddning av quiz");
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  const joinQuiz = async () => {
    if (!playerName.trim()) return;
    
    setIsJoining(true);
    
    try {
      // Add player to the quiz's guests collection
      const playerRef = await addDoc(collection(db, "quizzes", quizId, "guests"), {
        name: playerName,
        birthYear: birthYear,
        musicInterests: musicInterests,
        avatar: avatarUrl,
        joinedAt: new Date()
      });
      
      // Save player info to localStorage
      localStorage.setItem(`quiz_${quizId}_player`, JSON.stringify({
        id: playerRef.id,
        name: playerName,
        birthYear: birthYear,
        musicInterests: musicInterests,
        avatar: avatarUrl
      }));
      
      // Navigate to lobby
      router.push(`/lobby/${quizId}?playerId=${playerRef.id}`);
    } catch (error) {
      console.error("Error joining quiz: ", error);
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Laddar quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Anslut till quiz</CardTitle>
            <CardDescription className="text-center">
              {quizName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Välj avatar typ</label>
                <div className="flex justify-between gap-2">
                  {avatarStyles.map((style, index) => (
                    <Button
                      key={index}
                      variant={selectedAvatarStyle === index && !isSelfie ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => {
                        setSelectedAvatarStyle(index);
                        setIsSelfie(false);
                      }}
                    >
                      {style.title}
                    </Button>
                  ))}
                  <Button
                    variant={isSelfie ? "default" : "outline"}
                    className="flex items-center"
                    onClick={() => setShowCamera(true)}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Selfie
                  </Button>
                </div>
              </div>

              {!isSelfie && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Välj din avatar</label>
                  <div className="flex justify-between gap-2">
                    {avatarSeeds.map((seed) => (
                      <Button
                        key={seed}
                        variant={selectedSeed === seed ? "default" : "outline"}
                        className="p-0 h-14 w-14"
                        onClick={() => setSelectedSeed(seed)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={`https://api.dicebear.com/7.x/${avatarStyles[selectedAvatarStyle].style}/svg?seed=seed-${seed}`}
                            alt={`Avatar ${seed}`} 
                          />
                          <AvatarFallback>{seed}</AvatarFallback>
                        </Avatar>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center py-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt="Din avatar" />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Ditt namn
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ange ditt namn"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="birthYear" className="block text-sm font-medium">
                  Födelseår
                </label>
                <Select
                  value={birthYear}
                  onValueChange={setBirthYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj ditt födelseår" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 100 }, (_, i) => 2010 - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <MusicInterestSelector 
                  selectedInterests={musicInterests}
                  onChange={setMusicInterests}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={joinQuiz}
              disabled={isJoining || !playerName.trim()}
            >
              {isJoining ? "Ansluter..." : "Anslut till Quiz"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {showCamera && (
        <SelfieCamera 
          onCapture={handleCaptureImage} 
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}