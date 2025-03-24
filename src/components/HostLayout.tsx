"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, Music, ChevronRight } from "lucide-react";

interface HostLayoutProps {
  children: React.ReactNode;
  quizName?: string;
  quizId?: string;
}

export default function HostLayout({ children, quizName, quizId }: HostLayoutProps) {
  const pathname = usePathname();
  
  const isHomePage = pathname === "/";
  const isDashboard = pathname === "/dashboard";
  const isHostPage = pathname.startsWith("/host/");
  
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Toppmeny */}
      <nav className="bg-white border-b border-gray-200 w-full py-2.5 sticky top-0 z-10">
        <div className="w-full px-4 mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-6">
              <Music className="h-6 w-6 text-purple-600 mr-2" />
              <span className="font-bold text-lg">MusicQuiz</span>
            </Link>
            
            {/* Sökväg (Breadcrumbs) */}
            <div className="flex items-center text-sm text-gray-500">
              {(isDashboard) && (
                <>
                  <span className={`flex items-center text-purple-600 font-medium`}>
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    <span>Dashboard</span>
                  </span>
                </>
              )}
              
              {isHostPage && quizName && (
                <>
                  <span className="text-purple-600 font-medium flex items-center">
                    <Music className="h-4 w-4 mr-1" />
                    {quizName}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div>
            {isHostPage && quizId && (
              <Link 
                href="/dashboard" 
                className="text-sm text-gray-600 hover:text-purple-600 flex items-center"
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                <span>Till Dashboard</span>
              </Link>
            )}
            
            {isDashboard && (
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-purple-600 flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                <span>Till Hem</span>
              </Link>
            )}
            
            {isHomePage && (
              <Link 
                href="/dashboard" 
                className="text-sm text-gray-600 hover:text-purple-600 flex items-center"
              >
                <LayoutDashboard className="h-4 w-4 mr-1" />
                <span>Se alla dina quiz</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Huvudinnehåll */}
      <motion.main 
        className="flex-grow flex items-center justify-center p-4 container mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      
      {/* Sidfot */}
      <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-500 w-full">
        <div className="container mx-auto">
          Musik Quiz — Skapad för en roligare quizupplevelse
        </div>
      </footer>
    </div>
  );
}