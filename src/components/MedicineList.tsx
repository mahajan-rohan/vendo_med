"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Check, Upload, X } from "lucide-react";

interface Medicine {
  name: string;
  tablets: number;
  dosage: string;
  indications: string;
}

interface PatientData {
  id: number;
  patientId?: string;
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
  paymentQrImage: string | null;
  setPaymentQrImage: React.Dispatch<React.SetStateAction<string | null>>;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MedicineList({
  patientData,
  onPrescribe,
  onDiagnosisChange,
  paymentQrImage,
  setPaymentQrImage,
  handleImageUpload,
}: MedicineListProps) {
  const [selectedMedicines, setSelectedMedicines] = useState<{
    [key: string]: number;
  }>({});
  const [diagnosis, setDiagnosis] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setPaymentQrImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    console.log("pay", paymentQrImage);
  }, [paymentQrImage]);

  return (
    <Card className="w-full bg-white shadow-xl rounded-xl overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle>Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6 space-y-2">
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

        <div className="mb-4 sm:mb-6">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Textarea
            id="diagnosis"
            placeholder="Enter your diagnosis"
            value={diagnosis}
            onChange={handleDiagnosisChange}
            className="mt-1"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <Label htmlFor="payment-qr">Payment QR Code</Label>
          <div className="mt-2">
            <input
              type="file"
              id="payment-qr"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {!paymentQrImage ? (
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload payment QR code
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            ) : (
              <div className="relative mt-2">
                <img
                  src={paymentQrImage || "/placeholder.svg"}
                  alt="Payment QR Code"
                  className="max-h-48 rounded-lg mx-auto object-contain"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-4">Available Medicines</h3>
        <ScrollArea className="h-[200px] sm:h-[300px] pr-4">
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
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
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
                        <Button size="sm" variant="ghost" className="ml-auto">
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
