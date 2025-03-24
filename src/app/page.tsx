"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Music } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import HostLayout from "@/components/HostLayout";

export default function Home() {
  const router = useRouter();
  const [quizName, setQuizName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createQuiz = async () => {
    if (!quizName.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Skapa ett nytt quiz i Firebase
      const docRef = await addDoc(collection(db, "quizzes"), {
        name: quizName,
        createdAt: serverTimestamp(),
        status: "lobby" // lobby, active, complete
      });
      
      // Navigera till quiz-skärmen med det nya quiz-id:t
      router.push(`/host/${docRef.id}`);
    } catch (error) {
      console.error("Error creating quiz: ", error);
      setIsLoading(false);
    }
  };

  return (
    <HostLayout>
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Music size={50} className="text-purple-600" />
            </div>
            <CardTitle className="text-center text-2xl">Musik Quiz</CardTitle>
            <CardDescription className="text-center">
              Skapa ett nytt quiz för dina vänner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Ange quiz namn"
                  value={quizName}
                  onChange={(e) => setQuizName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              onClick={createQuiz}
              disabled={isLoading || !quizName.trim()}
            >
              {isLoading ? "Skapar..." : "Skapa Quiz"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </HostLayout>
  );
}