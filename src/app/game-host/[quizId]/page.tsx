"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import HostLayout from "@/components/HostLayout";
import { Music } from "lucide-react";

interface Question {
  correctAnswers: {
    title: string;
    artist: string;
    year: string;
  };
  artistOptions: string[];
  titleOptions: string[];
  trivia: {
    question: string;
    correctAnswer: string;
    options: string[];
  };
}

interface Quiz {
  quizTitle: string;
  questions: Question[];
}

export default function GameHostPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  
  const [quizName, setQuizName] = useState<string>("");
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizDoc = await getDoc(doc(db, "quizzes", quizId));
        
        if (quizDoc.exists()) {
          setQuizName(quizDoc.data().name);
          
          // Kontrollera om quizet har genererade frågor
          if (quizDoc.data().questions) {
            setQuizData({
              quizTitle: quizDoc.data().name,
              questions: quizDoc.data().questions
            });
          } else {
            setError("Quizet har inte genererats ännu");
          }
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

  if (isLoading) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Laddar quiz...</p>
        </div>
      </HostLayout>
    );
  }

  if (error) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout quizName={quizName} quizId={quizId}>
      <div className="w-full max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center">
              <Music className="mr-2 h-5 w-5 text-purple-600" />
              <CardTitle className="text-xl">{quizName}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Quizet är genererat och redo!</h2>
              <p className="mb-4">
                {quizData?.questions.length} frågor har skapats baserat på dina gästers musiksmak.
              </p>
              <p className="mb-8">
                Mer detaljerad funktionalitet för att hantera spelet kommer i nästa version.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Kommande funktioner:</h3>
                  <ul className="text-left list-disc pl-5 space-y-1">
                    <li>Styra spelet och visa frågor på deltagarnas skärmar</li>
                    <li>Se realtidsresultat och poängställning</li>
                    <li>Avslöja rätt svar och detaljer om låtarna</li>
                    <li>Pausfunktionalitet och tidsbegränsning per fråga</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-bold mb-2">Exempel på genererad fråga:</h3>
                  {quizData && quizData.questions.length > 0 && (
                    <div className="text-left">
                      <p><strong>Låt:</strong> {quizData.questions[0].correctAnswers.title}</p>
                      <p><strong>Artist:</strong> {quizData.questions[0].correctAnswers.artist}</p>
                      <p><strong>År:</strong> {quizData.questions[0].correctAnswers.year}</p>
                      <p className="mt-2"><strong>Trivia:</strong> {quizData.questions[0].trivia.question}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </HostLayout>
  );
}