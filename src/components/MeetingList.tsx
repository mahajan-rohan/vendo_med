"use client";

import { useState, useEffect } from "react";
import { Check, X, Minus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Medicine {
  name: string;
  tablets: number;
  dosage: string;
  indications: string;
  id?: string;
  price?: number;
  weightPerTablet?: string;
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
  patientData?: PatientData;
  onPrescribe: (prescriptions: { name: string; quantity: number }[]) => void;
  onClose?: () => void;
}

export function MedicineList({
  patientData,
  onPrescribe,
  onClose,
}: MedicineListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedicines, setSelectedMedicines] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [isPrescribing, setIsPrescribing] = useState(false);

  useEffect(() => {
    if (patientData?.medicinesAvailable) {
      setAvailableMedicines(patientData.medicinesAvailable);
    }
  }, [patientData]);

  const filteredMedicines = availableMedicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.indications.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMedicine = (medicine: Medicine) => {
    const existingIndex = selectedMedicines.findIndex(
      (m) => m.name === medicine.name
    );

    if (existingIndex >= 0) {
      // If already in the list, increment quantity
      const updated = [...selectedMedicines];
      updated[existingIndex].quantity += 1;
      setSelectedMedicines(updated);
    } else {
      // Add to the list with quantity 1
      setSelectedMedicines([
        ...selectedMedicines,
        { name: medicine.name, quantity: 1 },
      ]);
    }
  };

  const handleRemoveMedicine = (medicineName: string) => {
    setSelectedMedicines(
      selectedMedicines.filter((m) => m.name !== medicineName)
    );
  };

  const handleQuantityChange = (medicineName: string, change: number) => {
    const updated = selectedMedicines.map((m) => {
      if (m.name === medicineName) {
        const newQuantity = Math.max(1, m.quantity + change);
        return { ...m, quantity: newQuantity };
      }
      return m;
    });
    setSelectedMedicines(updated);
  };

  const handlePrescribe = () => {
    setIsPrescribing(true);
    onPrescribe(selectedMedicines);

    // Reset after prescription is sent
    setTimeout(() => {
      setIsPrescribing(false);
      setSelectedMedicines([]);
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <Card className="w-full shadow-lg border-2 border-primary/20">
      <CardHeader className="pb-3 pt-5 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Prescribe Medicines
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search medicines..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 px-4">
          <TabsTrigger value="available">Available Medicines</TabsTrigger>
          <TabsTrigger value="selected">
            Selected
            {selectedMedicines.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedMedicines.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-0">
          <ScrollArea className="h-[300px] md:h-[400px]">
            <div className="grid gap-2 p-4">
              {filteredMedicines.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No medicines found matching your search.
                </p>
              ) : (
                filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.name}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{medicine.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {medicine.dosage} • {medicine.tablets} tablets
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {medicine.indications}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={() => handleAddMedicine(medicine)}
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="selected" className="mt-0">
          <ScrollArea className="h-[300px] md:h-[400px]">
            <div className="grid gap-2 p-4">
              {selectedMedicines.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No medicines selected yet.
                </p>
              ) : (
                selectedMedicines.map((medicine) => (
                  <div
                    key={medicine.name}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{medicine.name}</h3>
                      <div className="flex items-center mt-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 rounded-full"
                          onClick={() =>
                            handleQuantityChange(medicine.name, -1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 font-medium">
                          {medicine.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleQuantityChange(medicine.name, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveMedicine(medicine.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <CardFooter className="border-t p-4">
        <Button
          className="w-full"
          disabled={selectedMedicines.length === 0 || isPrescribing}
          onClick={handlePrescribe}
        >
          {isPrescribing ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Prescribed
            </>
          ) : (
            "Prescribe Selected Medicines"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
