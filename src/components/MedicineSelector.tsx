import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Medicine {
  name: string;
  tablets: number;
  dosage: string;
  indications: string;
}

interface MedicineSelectorProps {
  medicines: Medicine[];
  onPrescribe: (prescriptions: { name: string; quantity: number }[]) => void;
}

export function MedicineSelector({
  medicines,
  onPrescribe,
}: MedicineSelectorProps) {
  const [selectedMedicines, setSelectedMedicines] = useState<{
    [key: string]: number;
  }>({});

  const handleQuantityChange = (medicineName: string, quantity: number) => {
    setSelectedMedicines((prev) => ({
      ...prev,
      [medicineName]: quantity,
    }));
  };

  const handlePrescribe = () => {
    const prescriptions = Object.entries(selectedMedicines)
      .filter(([_, quantity]) => quantity > 0)
      .map(([name, quantity]) => ({ name, quantity }));
    onPrescribe(prescriptions);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-h-[60vh] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Available Medicines</h3>
      {medicines.map((medicine) => (
        <div key={medicine.name} className="mb-4 p-2 border rounded">
          <h4 className="font-medium">{medicine.name}</h4>
          <p className="text-sm text-gray-600">Dosage: {medicine.dosage}</p>
          <p className="text-sm text-gray-600">
            Indications: {medicine.indications}
          </p>
          <div className="mt-2 flex items-center">
            <Label htmlFor={`quantity-${medicine.name}`} className="mr-2">
              Quantity:
            </Label>
            <Input
              id={`quantity-${medicine.name}`}
              type="number"
              min="0"
              max={medicine.tablets}
              value={selectedMedicines[medicine.name] || 0}
              onChange={(e) =>
                handleQuantityChange(
                  medicine.name,
                  Number.parseInt(e.target.value) || 0
                )
              }
              className="w-20"
            />
            <span className="ml-2 text-sm text-gray-600">
              / {medicine.tablets}
            </span>
          </div>
        </div>
      ))}
      <Button onClick={handlePrescribe} className="mt-4 w-full">
        Prescribe Selected Medicines
      </Button>
    </div>
  );
}
