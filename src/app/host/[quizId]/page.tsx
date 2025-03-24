"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { Users, Music } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams } from "next/navigation";
import HostLayout from "@/components/HostLayout";
import { GlowCard } from "@/components/GlowCard";

interface Guest {
  id: string;
  name: string;
  avatar: string;
}

export default function HostQuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  
  const [quizName, setQuizName] = useState<string>("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Skapa join-URL med absolut sökväg, kontrollera att window är tillgängligt
  const joinUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/join/${quizId}` 
    : "";

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

    // Lyssna på gäster som ansluter i realtid
    const unsubscribe = onSnapshot(
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

    // Rensa lyssnaren när komponenten avmonteras
    return () => unsubscribe();
  }, [quizId]);

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
    <HostLayout quizName={quizName} quizId={quizId}>
      <div className="w-full max-w-md">
        <Card className="w-full mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <Music className="mr-2 h-5 w-5 text-purple-600" />
              <CardTitle className="text-xl">{quizName}</CardTitle>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-gray-500" />
              <span>{guests.length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center p-4">
              <p className="mb-4 text-center">
                Be dina vänner att skanna QR-koden för att ansluta till quizet:
              </p>
              <GlowCard className="w-[250px] h-[250px] mb-4">
                <div className="flex items-center justify-center h-full">
                  <QRCodeSVG value={joinUrl} size={200} />
                </div>
              </GlowCard>
              <p className="mt-4 text-sm text-gray-500 text-center break-all">
                Eller dela länken: {joinUrl}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Anslutna gäster</CardTitle>
          </CardHeader>
          <CardContent>
            {guests.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Väntar på att gäster ska ansluta...
              </p>
            ) : (
              <ul className="space-y-2">
                {guests.map((guest) => (
                  <motion.li
                    key={guest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center p-2 rounded-lg border border-gray-100"
                  >
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={guest.avatar} alt={guest.name} />
                      <AvatarFallback>{guest.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{guest.name}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </HostLayout>
  );
}