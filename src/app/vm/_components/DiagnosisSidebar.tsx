"use client";

import type React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Thermometer, Heart, Printer } from "lucide-react";
import { useVendingMachine } from "@/context/VendingMachineContext";

const DiagnosisSidebar: React.FC<{ analyzing: boolean; progress: number }> = ({
  analyzing,
  progress,
}) => {
  const { diagnosis, setDiagnosis } = useVendingMachine();

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setDiagnosis({
          temperature: "36.6°C",
          bloodPressure: "120/80 mmHg",
          heartRate: "72 bpm",
          oxygenSaturation: "98%",
          bmi: "22.5",
        });
      }, 1000);
    }
  }, [progress, setDiagnosis]);

  return (
    <div className="w-[320px] border-l bg-white p-6 shadow-lg">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold text-primary">
          Health Analysis
        </CardTitle>
      </CardHeader>

      {analyzing ? (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <p className="mb-3 font-medium text-primary">
              Analyzing your health...
            </p>
            <Progress value={progress} className="h-2 w-full" />
            <p className="mt-2 text-sm text-muted-foreground">
              {progress}% complete
            </p>
          </CardContent>
        </Card>
      ) : diagnosis ? (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10 pb-2 pt-4">
              <CardTitle className="flex items-center text-lg font-medium">
                <Thermometer className="mr-2 h-5 w-5 text-primary" />
                Temperature
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-primary">
                {diagnosis.temperature}
              </div>
              <p className="text-sm text-muted-foreground">
                Normal range: 36.1°C - 37.2°C
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10 pb-2 pt-4">
              <CardTitle className="flex items-center text-lg font-medium">
                <Heart className="mr-2 h-5 w-5 text-primary" />
                Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-primary">
                {diagnosis.heartRate}
              </div>
              <p className="text-sm text-muted-foreground">
                Normal range: 60-100 bpm
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Start the health analysis to see your vital signs.
            </p>
          </CardContent>
        </Card>
      )}

      <CardFooter className="flex justify-center px-0 pt-6">
        <Button className="w-full" disabled={!diagnosis} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Analysis
        </Button>
      </CardFooter>
    </div>
  );
};

export default DiagnosisSidebar;
