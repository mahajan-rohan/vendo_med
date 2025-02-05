import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import DiagnosisItem from "./DiagnosisItem";
import { Progress } from "@/components/ui/progress";
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
  }, [progress]);

  return (
    <div className="flex flex-col w-[25%]">
      <h2 className="text-xl font-semibold">Patient Diagnosis</h2>
      {analyzing ? (
        <div>
          <p className="mb-2">Analyzing your health...</p>
          <Progress value={progress} className="w-full" />
        </div>
      ) : diagnosis ? (
        <div className="space-y-4">
          <DiagnosisItem label="Temperature" value={diagnosis.temperature} />
          <DiagnosisItem
            label="Blood Pressure"
            value={diagnosis.bloodPressure}
          />
          <DiagnosisItem label="Heart Rate" value={diagnosis.heartRate} />
          <DiagnosisItem
            label="Oxygen Saturation"
            value={diagnosis.oxygenSaturation}
          />
          <DiagnosisItem label="BMI" value={diagnosis.bmi} />
        </div>
      ) : (
        <p>Start the health analysis to see your diagnosis.</p>
      )}
      <Button className="w-full">Print Diagnosis</Button>
    </div>
  );
};

export default DiagnosisSidebar;
