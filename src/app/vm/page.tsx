"use client";

import { useEffect, useState } from "react";
import { Phone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DiagnosisSidebar from "./_components/DiagnosisSidebar";
import VideoSection from "./_components/VideoSection";
import { useVendingMachine } from "@/context/VendingMachineContext";
import Footer from "./_components/Footer";

interface Diagnosis {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  oxygenSaturation: string;
  bmi: string;
}

const socket = io("http://localhost:4000");

export default function VendingMachineScreen() {
  const {
    analyzing,
    setAnalyzing,
    progress,
    setProgress,
    showSidebar,
    setShowSidebar,
  } = useVendingMachine();

  useEffect(() => {
    if (analyzing) {
      const timer = setInterval(() => {
        setProgress((oldProgress: number) => {
          if (oldProgress === 100) {
            clearInterval(timer);
            setAnalyzing(false);
            return 100;
          }
          return Math.min(oldProgress + 10, 100);
        });
      }, 500);
      return () => clearInterval(timer);
    }
  }, [analyzing]);

  const startAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
  };

  return (
    <div>
      <div className="flex h-screen w-full bg-gray-100">
        <main className="flex-1 flex flex-col min-h-screen">
          <Header />
          <VideoSection socket={socket} />
          <Footer onStartAnalysis={startAnalysis} />
        </main>
        {/* <Sidebar className="w-80 border-l relative"> */}
        {showSidebar && (
          <DiagnosisSidebar analyzing={analyzing} progress={progress} />
        )}
        {/* </Sidebar> */}
      </div>
    </div>
  );
}

function Header() {
  const { setShowSidebar } = useVendingMachine();

  return (
    <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">MediVend Health Station</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm">Status: Online 🟢</span>
        {/* <Select>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
          </SelectContent>
        </Select> */}
        <Button
          variant="outline"
          size="icon"
          className="bg-black"
          onClick={() => {
            setShowSidebar((prev: boolean) => !prev);
          }}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
