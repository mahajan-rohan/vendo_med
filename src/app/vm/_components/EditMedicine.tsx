"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";

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

interface EditMedicineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: {
    id: string;
    name: string;
    dosage: string;
    indications: string;
    tablets: number;
    weightPerTablet: string;
    price: number;
  } | null;
  onSubmit: (data: MedicineFormValues) => void;
}

export default function EditMedicineDialog({
  open,
  onOpenChange,
  medicine,
  onSubmit,
}: EditMedicineDialogProps) {
  const form = useForm<MedicineFormValues>({
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

  useEffect(() => {
    if (medicine) {
      form.reset({
        name: medicine.name,
        dosage: medicine.dosage,
        indications: medicine.indications,
        tablets: medicine.tablets,
        weightPerTablet: medicine.weightPerTablet,
        price: medicine.price,
      });
    }
  }, [medicine, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
          <DialogDescription>
            Update the details of the selected medicine.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
              control={form.control}
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Medicine</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
