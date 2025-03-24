import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import HostLayout from "@/components/HostLayout";

export default function DashboardLoading() {
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
        
        <Tabs defaultValue="active" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Aktiva Quiz</TabsTrigger>
            <TabsTrigger value="guests">Gäster</TabsTrigger>
            <TabsTrigger value="summary">Sammanfattning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aktiva Quiz</CardTitle>
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