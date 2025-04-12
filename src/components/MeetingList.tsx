"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Check } from "lucide-react";

interface Medicine {
  name: string;
  tablets: number;
  dosage: string;
  indications: string;
}

interface PatientData {
  id: number;
  patientId: string;
  name: string;
  age: number;
  symptoms: string;
  urgency: string;
  medicinesAvailable: Medicine[];
}

interface MedicineListProps {
  patientData: PatientData;
  onPrescribe: (prescriptions: { name: string; quantity: number }[]) => void;
  onDiagnosisChange?: (diagnosis: string) => void;
}

export function MedicineList({
  patientData,
  onPrescribe,
  onDiagnosisChange,
}: MedicineListProps) {
  const [selectedMedicines, setSelectedMedicines] = useState<{
    [key: string]: number;
  }>({});
  const [diagnosis, setDiagnosis] = useState("");

  const toggleMedicine = (medicineName: string) => {
    setSelectedMedicines((prev) => {
      const newSelected = { ...prev };
      if (newSelected[medicineName]) {
        delete newSelected[medicineName];
      } else {
        newSelected[medicineName] = 1;
      }
      return newSelected;
    });
  };

  const updateQuantity = (medicineName: string, delta: number) => {
    setSelectedMedicines((prev) => {
      const newSelected = { ...prev };
      const currentQuantity = newSelected[medicineName] || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      if (newQuantity === 0) {
        delete newSelected[medicineName];
      } else {
        newSelected[medicineName] = newQuantity;
      }
      return newSelected;
    });
  };

  const handleDiagnosisChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDiagnosis(value);
    if (onDiagnosisChange) {
      onDiagnosisChange(value);
    }
  };

  const prescribeMedicines = () => {
    const prescriptions = Object.entries(selectedMedicines).map(
      ([name, quantity]) => ({
        name,
        quantity,
      })
    );
    onPrescribe(prescriptions);
  };

  return (
    <Card className="w-full max-w-md bg-white shadow-xl rounded-xl overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 space-y-2">
          <p>
            <strong>Name:</strong> {patientData.name}
          </p>
          <p>
            <strong>Age:</strong> {patientData.age}
          </p>
          <p>
            <strong>Symptoms:</strong> {patientData.symptoms}
          </p>
          <p>
            <strong>Urgency:</strong> {patientData.urgency}
          </p>
        </div>

        <div className="mb-6">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Textarea
            id="diagnosis"
            placeholder="Enter your diagnosis"
            value={diagnosis}
            onChange={handleDiagnosisChange}
            className="mt-1"
          />
        </div>

        <h3 className="text-lg font-semibold mb-4">Available Medicines</h3>
        <ScrollArea className="h-[300px] pr-4">
          <AnimatePresence>
            {patientData.medicinesAvailable.map((medicine, index) => (
              <motion.div
                key={medicine.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className={`mb-4 cursor-pointer transition-all duration-300 ${
                    selectedMedicines[medicine.name]
                      ? "bg-primary/10 border-primary"
                      : ""
                  }`}
                  onClick={() => toggleMedicine(medicine.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-lg">{medicine.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Dosage: {medicine.dosage}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Indications: {medicine.indications}
                        </p>
                      </div>
                      {selectedMedicines[medicine.name] && (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(medicine.name, -1);
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={selectedMedicines[medicine.name]}
                            onChange={(e) => {
                              e.stopPropagation();
                              const value = Number.parseInt(e.target.value);
                              if (!isNaN(value) && value >= 0) {
                                setSelectedMedicines((prev) => ({
                                  ...prev,
                                  [medicine.name]: value,
                                }));
                              }
                            }}
                            className="w-16 text-center"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(medicine.name, 1);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {!selectedMedicines[medicine.name] && (
                        <Button size="sm" variant="ghost">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
        <Button className="w-full mt-4" onClick={prescribeMedicines}>
          Prescribe Selected Medicines
        </Button>
      </CardContent>
    </Card>
  );
}
