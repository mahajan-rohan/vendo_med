"use client";

import React, { createContext, useContext, useState } from "react";

export const medicinesData = [
  {
    id: "1",
    name: "Paracetamol",
    dosage: "500mg",
    indications: "Fever, Pain relief",
    tablets: 10,
    weightPerTablet: "500mg",
    price: 50,
  },
  {
    id: "2",
    name: "Ibuprofen",
    dosage: "400mg",
    indications: "Pain relief, Inflammation",
    tablets: 20,
    weightPerTablet: "400mg",
    price: 100,
  },
  {
    id: "3",
    name: "Amoxicillin",
    dosage: "250mg",
    indications: "Bacterial infections",
    tablets: 15,
    weightPerTablet: "250mg",
    price: 150,
  },
  // Add more medicines as needed
];

type Medicine = (typeof medicinesData)[0];

interface Diagnosis {
  temperature: string;
  bloodPressure: string;
  heartRate: string;
  oxygenSaturation: string;
  bmi: string;
}

interface VendingMachineContextType {
  analyzing: boolean;
  setAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  diagnosis: Diagnosis | null;
  setDiagnosis: React.Dispatch<React.SetStateAction<Diagnosis | null>>;
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  medicinesList: Medicine[];
  updateMedicinesList: React.Dispatch<React.SetStateAction<Medicine[]>>;
}

const VendingMachineContext = createContext<
  VendingMachineContextType | undefined
>(undefined);

export const VendingMachineProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [medicinesList, updateMedicinesList] = useState(medicinesData);

  return (
    <VendingMachineContext.Provider
      value={{
        analyzing,
        setAnalyzing,
        progress,
        setProgress,
        diagnosis,
        setDiagnosis,
        showSidebar,
        setShowSidebar,
        medicinesList,
        updateMedicinesList,
      }}
    >
      {children}
    </VendingMachineContext.Provider>
  );
};

export const useVendingMachine = () => {
  const context = useContext(VendingMachineContext);
  if (!context)
    throw new Error(
      "useVendingMachine must be used within a VendingMachineProvider"
    );
  return context;
};
