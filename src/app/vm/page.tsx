"use client";

import { useEffect, useState } from "react";
import { Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import DiagnosisSidebar from "./_components/DiagnosisSidebar";
import VideoSection from "./_components/VideoSection";
import { useVendingMachine } from "@/context/VendingMachineContext";
import Footer from "./_components/Footer";
import AdminPanel from "./_components/AdminPanel";

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
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
  }, [analyzing, setAnalyzing, setProgress]);

  const startAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
  };

  if (showAdminPanel) {
    return (
      <div className="flex h-screen w-full bg-gray-100">
        <main className="flex-1 flex flex-col min-h-screen">
          <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">MediVend Admin Panel</h1>
            <Button
              variant="outline"
              className="bg-black/10 hover:bg-black/20"
              onClick={() => setShowAdminPanel(false)}
            >
              Exit Admin Mode
            </Button>
          </header>
          <div className="flex-1 overflow-auto">
            <AdminPanel />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <main className="flex-1 flex flex-col min-h-screen">
        <Header setShowAdminPanel={setShowAdminPanel} />
        <div className="flex-1 overflow-auto">
          <VideoSection socket={socket} />
        </div>
        <Footer onStartAnalysis={startAnalysis} />
      </main>
      {showSidebar && (
        <DiagnosisSidebar analyzing={analyzing} progress={progress} />
      )}
    </div>
  );
}

function Header({
  setShowAdminPanel,
}: {
  setShowAdminPanel: (show: boolean) => void;
}) {
  const { setShowSidebar } = useVendingMachine();

  return (
    <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">MediVend Health Station</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm">Status: Online 🟢</span>
        <Button
          variant="outline"
          size="icon"
          className="bg-black/10 hover:bg-black/20"
          onClick={() => setShowAdminPanel(true)}
          title="Admin Panel"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-black/10 hover:bg-black/20"
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
