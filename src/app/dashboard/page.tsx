"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, query, orderBy, where, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { Music, Plus, Trash2, ExternalLink, Users, Clock, BarChart3, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import HostLayout from "@/components/HostLayout";

interface Quiz {
  id: string;
  name: string;
  createdAt: any;
  status: string;
  guestCount?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [newQuizName, setNewQuizName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statsTab, setStatsTab] = useState("active");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      // Hämta alla quiz och sortera efter skapandedatum
      const q = query(collection(db, "quizzes"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const quizzesWithGuests = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Hämta antal gäster för varje quiz
          const guestsSnapshot = await getDocs(collection(db, "quizzes", doc.id, "guests"));
          
          return {
            id: doc.id,
            name: data.name,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            status: data.status || "lobby",
            guestCount: guestsSnapshot.size
          };
        })
      );
      
      setQuizzes(quizzesWithGuests);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createQuiz = async () => {
    if (!newQuizName.trim()) return;
    
    setIsCreating(true);
    
    try {
      // Skapa ett nytt quiz i Firebase
      const docRef = await addDoc(collection(db, "quizzes"), {
        name: newQuizName,
        createdAt: serverTimestamp(),
        status: "lobby" // lobby, active, complete
      });
      
      // Uppdatera listan med quiz
      await fetchQuizzes();
      
      // Återställ formuläret
      setNewQuizName("");
      
      // Navigera till quiz-skärmen med det nya quiz-id:t
      router.push(`/host/${docRef.id}`);
    } catch (error) {
      console.error("Error creating quiz: ", error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    setDeleteLoading(true);
    try {
      // Ta bort gäster först (subsamling)
      const guestsSnapshot = await getDocs(collection(db, "quizzes", quizId, "guests"));
      const deleteGuestPromises = guestsSnapshot.docs.map(async (guestDoc) => {
        await deleteDoc(doc(db, "quizzes", quizId, "guests", guestDoc.id));
      });
      await Promise.all(deleteGuestPromises);
      
      // Ta bort själva quizet
      await deleteDoc(doc(db, "quizzes", quizId));
      
      // Uppdatera listan
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setOpenDeleteDialog(null);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string): React.ReactNode => {
    switch (status) {
      case "lobby":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Väntande</Badge>;
      case "active":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktiv</Badge>;
      case "complete":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Avslutad</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Rendering av skelettladdning
  if (isLoading) {
    return (
      <HostLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Musik Quiz Dashboard</h1>
              <p className="text-gray-500">Hantera och skapa nya quiz</p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Alla Quiz</TabsTrigger>
              <TabsTrigger value="active">Aktiva</TabsTrigger>
              <TabsTrigger value="complete">Avslutade</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <div className="bg-white divide-y">
                  <div className="grid grid-cols-5 p-4 bg-gray-50">
                    <div className="font-medium">Quiz Namn</div>
                    <div className="font-medium">Status</div>
                    <div className="font-medium">Skapad</div>
                    <div className="font-medium">Gäster</div>
                    <div className="font-medium text-right">Hantera</div>
                  </div>
                  
                  {/* Skeleton rows */}
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="grid grid-cols-5 p-4 items-center">
                      <div><Skeleton className="h-5 w-32" /></div>
                      <div><Skeleton className="h-5 w-20" /></div>
                      <div><Skeleton className="h-5 w-40" /></div>
                      <div><Skeleton className="h-5 w-8" /></div>
                      <div className="flex justify-end space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Skeleton className="h-0.5 w-full my-8" />

          <h2 className="text-2xl font-bold mb-4">Statistik</h2>
          
          <Tabs value={statsTab} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Aktiva Quiz</TabsTrigger>
              <TabsTrigger value="guests">Gäster</TabsTrigger>
              <TabsTrigger value="summary">Sammanfattning</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="mr-2 h-5 w-5 text-purple-600" />
                    Aktiva Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center mb-2">
                          <Skeleton className="h-5 w-5 mr-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Musik Quiz Dashboard</h1>
            <p className="text-gray-500">Hantera och skapa nya quiz</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Nytt Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Skapa nytt quiz</DialogTitle>
                <DialogDescription>
                  Ange ett namn för ditt nya musikquiz. Du kommer sedan att dirigeras till värdsidan.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Quiz namn"
                value={newQuizName}
                onChange={(e) => setNewQuizName(e.target.value)}
                className="my-4"
              />
              <DialogFooter>
                <Button 
                  onClick={createQuiz} 
                  disabled={isCreating || !newQuizName.trim()}
                >
                  {isCreating ? "Skapar..." : "Skapa Quiz"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Alla Quiz</TabsTrigger>
            <TabsTrigger value="active">Aktiva</TabsTrigger>
            <TabsTrigger value="complete">Avslutade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <QuizTable 
              quizzes={quizzes} 
              isLoading={isLoading} 
              openDeleteDialog={openDeleteDialog}
              setOpenDeleteDialog={setOpenDeleteDialog}
              deleteQuiz={deleteQuiz}
              deleteLoading={deleteLoading}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              router={router}
            />
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            <QuizTable 
              quizzes={quizzes.filter(q => q.status === "lobby" || q.status === "active")} 
              isLoading={isLoading} 
              openDeleteDialog={openDeleteDialog}
              setOpenDeleteDialog={setOpenDeleteDialog}
              deleteQuiz={deleteQuiz}
              deleteLoading={deleteLoading}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              router={router}
            />
          </TabsContent>
          
          <TabsContent value="complete" className="space-y-4">
            <QuizTable 
              quizzes={quizzes.filter(q => q.status === "complete")} 
              isLoading={isLoading} 
              openDeleteDialog={openDeleteDialog}
              setOpenDeleteDialog={setOpenDeleteDialog}
              deleteQuiz={deleteQuiz}
              deleteLoading={deleteLoading}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
              router={router}
            />
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <h2 className="text-2xl font-bold mb-4">Statistik</h2>
        
        <Tabs value={statsTab} onValueChange={setStatsTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Aktiva Quiz</TabsTrigger>
            <TabsTrigger value="guests">Gäster</TabsTrigger>
            <TabsTrigger value="summary">Sammanfattning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="mr-2 h-5 w-5 text-purple-600" />
                  Aktiva Quiz
                </CardTitle>
                <CardDescription>
                  Översikt över dina aktiva quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Totalt antal Quiz"
                    value={quizzes.length}
                    icon={<BarChart3 className="h-5 w-5 text-purple-600" />}
                  />
                  <StatCard
                    title="Aktiva Quiz"
                    value={quizzes.filter(q => q.status === "active").length}
                    icon={<Music className="h-5 w-5 text-green-600" />}
                  />
                  <StatCard
                    title="Väntande i Lobby"
                    value={quizzes.filter(q => q.status === "lobby").length}
                    icon={<Clock className="h-5 w-5 text-yellow-600" />}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="guests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-purple-600" />
                  Gäststatistik
                </CardTitle>
                <CardDescription>
                  Information om deltagare i dina quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Totalt antal gäster"
                    value={quizzes.reduce((sum, quiz) => sum + (quiz.guestCount || 0), 0)}
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                  />
                  <StatCard
                    title="Genomsnitt per quiz"
                    value={quizzes.length > 0 
                      ? Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.guestCount || 0), 0) / quizzes.length) 
                      : 0}
                    icon={<BarChart3 className="h-5 w-5 text-green-600" />}
                  />
                  <StatCard
                    title="Flest deltagare"
                    value={quizzes.length > 0 
                      ? Math.max(...quizzes.map(quiz => quiz.guestCount || 0)) 
                      : 0}
                    icon={<Users className="h-5 w-5 text-purple-600" />}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                  Sammanfattning
                </CardTitle>
                <CardDescription>
                  Översikt över all din quiz-aktivitet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Totalt skapade"
                    value={quizzes.length}
                    icon={<Plus className="h-5 w-5 text-blue-600" />}
                  />
                  <StatCard
                    title="Senaste 30 dagarna"
                    value={quizzes.filter(quiz => {
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return quiz.createdAt > thirtyDaysAgo;
                    }).length}
                    icon={<CalendarDays className="h-5 w-5 text-green-600" />}
                  />
                  <StatCard
                    title="Avslutade Quiz"
                    value={quizzes.filter(q => q.status === "complete").length}
                    icon={<Music className="h-5 w-5 text-purple-600" />}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HostLayout>
  );
}

// Komponent för Quiz-tabellen
function QuizTable({ 
  quizzes, 
  isLoading, 
  openDeleteDialog,
  setOpenDeleteDialog,
  deleteQuiz,
  deleteLoading,
  formatDate,
  getStatusBadge,
  router
}: { 
  quizzes: Quiz[], 
  isLoading: boolean,
  openDeleteDialog: string | null,
  setOpenDeleteDialog: (id: string | null) => void,
  deleteQuiz: (id: string) => Promise<void>,
  deleteLoading: boolean,
  formatDate: (date: Date) => string,
  getStatusBadge: (status: string) => React.ReactNode,
  router: any
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quiz Namn</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Skapad</TableHead>
            <TableHead>Gäster</TableHead>
            <TableHead className="text-right">Hantera</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                <div className="flex flex-col items-center justify-center">
                  <Music className="h-6 w-6 text-gray-300 mb-2" />
                  <p className="text-gray-500">Inga quiz hittades</p>
                  <p className="text-sm text-gray-400 mt-1">Klicka på "Nytt Quiz" för att komma igång</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            quizzes.map((quiz) => (
              <TableRow key={quiz.id}>
                <TableCell className="font-medium">{quiz.name}</TableCell>
                <TableCell>{getStatusBadge(quiz.status)}</TableCell>
                <TableCell>{formatDate(quiz.createdAt)}</TableCell>
                <TableCell>{quiz.guestCount || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push(`/host/${quiz.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Öppna</span>
                    </Button>
                    
                    <Dialog open={openDeleteDialog === quiz.id} onOpenChange={(open) => {
                      if (!open) setOpenDeleteDialog(null);
                      else setOpenDeleteDialog(quiz.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Ta bort</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ta bort quiz</DialogTitle>
                          <DialogDescription>
                            Är du säker på att du vill ta bort "{quiz.name}"? Detta kan inte ångras.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setOpenDeleteDialog(null)}
                          >
                            Avbryt
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => deleteQuiz(quiz.id)}
                            disabled={deleteLoading}
                          >
                            {deleteLoading ? "Tar bort..." : "Ta bort"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
          {/* Fyll på med tomma rader för att undvika layout skift */}
          {quizzes.length > 0 && quizzes.length < 3 && (
            Array(3 - quizzes.length).fill(0).map((_, index) => (
              <TableRow key={`empty-${index}`} className="h-16">
                <TableCell colSpan={5}>&nbsp;</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Komponent för statistikkort
function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-sm font-medium text-gray-600 ml-2">{title}</h3>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}