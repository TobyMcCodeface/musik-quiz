"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Clock, Music } from "lucide-react";
import MusicEqualizer from "@/components/MusicEqualizer";

interface Guest {
  id: string;
  name: string;
  avatar: string;
}

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const quizId = params.quizId as string;
  const playerId = searchParams?.get("playerId");
  
  const [quizName, setQuizName] = useState<string>("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Guest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!playerId) {
      const savedPlayer = localStorage.getItem(`quiz_${quizId}_player`);
      if (savedPlayer) {
        const player = JSON.parse(savedPlayer);
        router.push(`/lobby/${quizId}?playerId=${player.id}`);
      } else {
        router.push(`/join/${quizId}`);
      }
      return;
    }

    const fetchQuizData = async () => {
      try {
        // Hämta quiz-information
        const quizDoc = await getDoc(doc(db, "quizzes", quizId));
        
        if (quizDoc.exists()) {
          setQuizName(quizDoc.data().name);
          
          // Kontrollera quiz-status
          if (quizDoc.data().status === "active") {
            // Quiz har startat, navigera till game-sidan
            router.push(`/game/${quizId}?playerId=${playerId}`);
            return;
          }
        } else {
          setError("Quiz hittades inte");
          return;
        }
        
        // Hämta spelarens information
        const playerDoc = await getDoc(doc(db, "quizzes", quizId, "guests", playerId));
        
        if (playerDoc.exists()) {
          setCurrentPlayer({
            id: playerDoc.id,
            ...playerDoc.data()
          } as Guest);
        } else {
          // Spelaren finns inte, gå tillbaka till join
          localStorage.removeItem(`quiz_${quizId}_player`);
          router.push(`/join/${quizId}`);
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError("Fel vid laddning av lobby");
        setIsLoading(false);
      }
    };

    fetchQuizData();

    // Lyssna på gäster som ansluter
    const guestsUnsubscribe = onSnapshot(
      collection(db, "quizzes", quizId, "guests"),
      (snapshot) => {
        const guestList: Guest[] = [];
        snapshot.forEach((doc) => {
          guestList.push({
            id: doc.id,
            ...doc.data()
          } as Guest);
        });
        setGuests(guestList);
      },
      (error) => {
        console.error("Error listening to guests: ", error);
      }
    );

    // Lyssna på quiz-status
    const quizUnsubscribe = onSnapshot(
      doc(db, "quizzes", quizId),
      (snapshot) => {
        if (snapshot.exists() && snapshot.data().status === "active") {
          // Quiz har startat, navigera till game-sidan
          router.push(`/game/${quizId}?playerId=${playerId}`);
        }
      },
      (error) => {
        console.error("Error listening to quiz status: ", error);
      }
    );

    return () => {
      guestsUnsubscribe();
      quizUnsubscribe();
    };
  }, [quizId, playerId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Laddar lobby...</p>
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
        <Card className="w-full mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center">{quizName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4 py-4 border-y">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Music className="h-5 w-5 text-purple-600" />
                <p className="text-center">Väntar på att värden ska starta quizet...</p>
              </div>
              <MusicEqualizer className="mb-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Anslutna deltagare</CardTitle>
              <div className="flex items-center text-gray-500">
                <Users className="h-5 w-5 mr-1" />
                <span>{guests.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guests.map((guest) => (
                <motion.li
                  key={guest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center p-2 rounded-lg border ${
                    guest.id === playerId ? "border-purple-200 bg-purple-50" : "border-gray-100"
                  }`}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={guest.avatar} alt={guest.name} />
                    <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{guest.name}</span>
                  {guest.id === playerId && (
                    <span className="ml-auto text-xs text-purple-500">Du</span>
                  )}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}