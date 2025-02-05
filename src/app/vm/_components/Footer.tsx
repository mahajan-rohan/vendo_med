import React from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendingMachine } from "@/context/VendingMachineContext";

const Footer: React.FC<{
  onStartAnalysis: () => void;
}> = ({ onStartAnalysis }) => {
  const { setShowSidebar } = useVendingMachine();

  return (
    <footer className="bg-gray-200 p-4 flex justify-between items-center">
      <Button variant="destructive" className="flex items-center">
        <Phone className="mr-2 h-4 w-4" /> Emergency Call
      </Button>
      <Button
        onClick={() => {
          onStartAnalysis();
          setShowSidebar(true);
        }}
        className="bg-green-500 hover:bg-green-600"
      >
        Start Health Analysis
      </Button>
    </footer>
  );
};

export default Footer;
