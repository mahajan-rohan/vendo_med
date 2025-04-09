"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Edit, Trash } from "lucide-react";
import { useVendingMachine } from "@/context/VendingMachineContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const medicineFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Medicine name must be at least 2 characters." }),
  dosage: z.string().min(1, { message: "Dosage is required." }),
  indications: z.string().min(3, { message: "Please provide indications." }),
  tablets: z.coerce
    .number()
    .positive({ message: "Number of tablets must be positive." }),
  weightPerTablet: z
    .string()
    .min(1, { message: "Weight per tablet is required." }),
  price: z.coerce.number().positive({ message: "Price must be positive." }),
});

type MedicineFormValues = z.infer<typeof medicineFormSchema>;

export default function MedicineManager() {
  const { medicinesList, updateMedicinesList } = useVendingMachine();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<
    (typeof medicinesList)[0] | null
  >(null);

  const addForm = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      indications: "",
      tablets: 0,
      weightPerTablet: "",
      price: 0,
    },
  });

  const editForm = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      indications: "",
      tablets: 0,
      weightPerTablet: "",
      price: 0,
    },
  });

  function onAddSubmit(data: MedicineFormValues) {
    const newMedicine = {
      id: Date.now().toString(), // Generate a unique ID
      ...data,
    };

    updateMedicinesList((prev) => [...prev, newMedicine]);
    setIsAddDialogOpen(false);
    addForm.reset();
  }

  function onEditSubmit(data: MedicineFormValues) {
    if (!selectedMedicine) return;

    updateMedicinesList((prev) =>
      prev.map((medicine) =>
        medicine.id === selectedMedicine.id
          ? { ...medicine, ...data }
          : medicine
      )
    );

    setIsEditDialogOpen(false);
    setSelectedMedicine(null);
  }

  function handleEdit(medicine: (typeof medicinesList)[0]) {
    setSelectedMedicine(medicine);
    editForm.reset({
      name: medicine.name,
      dosage: medicine.dosage,
      indications: medicine.indications,
      tablets: medicine.tablets,
      weightPerTablet: medicine.weightPerTablet,
      price: medicine.price,
    });
    setIsEditDialogOpen(true);
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to remove this medicine?")) {
      updateMedicinesList((prev) =>
        prev.filter((medicine) => medicine.id !== id)
      );
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Medicine Inventory</CardTitle>
            <CardDescription>
              Manage the medicines available in the vending machine
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" /> Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Medicine</DialogTitle>
                <DialogDescription>
                  Enter the details of the new medicine to add to the inventory.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form
                  onSubmit={addForm.handleSubmit(onAddSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicine Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Paracetamol" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="weightPerTablet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight Per Tablet</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="tablets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Tablets</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={addForm.control}
                    name="indications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Indications</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Fever, Pain relief"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Medicine</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Tablets</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicinesList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-6"
                  >
                    No medicines in inventory. Add some medicines to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                medicinesList.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">
                      <div>
                        {medicine.name}
                        <div className="text-xs text-muted-foreground mt-1">
                          {medicine.indications}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{medicine.dosage}</Badge>
                    </TableCell>
                    <TableCell>{medicine.tablets}</TableCell>
                    <TableCell>₹{medicine.price}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(medicine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(medicine.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
