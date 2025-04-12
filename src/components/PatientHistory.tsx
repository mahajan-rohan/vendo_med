"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useKit } from "@/context/DoctorContext";
import {
  ClipboardList,
  FileX2,
  Calendar,
  Pill,
  Stethoscope,
} from "lucide-react";

interface Prescription {
  name: string;
  quantity: number;
}

interface Consultation {
  id: string;
  patientName: string;
  patientId?: string;
  date: Date;
  diagnosis: string;
  prescription: Prescription[];
  symptoms: string;
}

export default function PatientHistory() {
  const { consultationHistory, setConsultationHistory, doctorInfo } = useKit();
  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState("");

  useEffect(() => {
    // Load consultation history from localStorage
    const loadConsultations = async () => {
      setLoading(true);
      try {
        // const storedConsultations = localStorage.getItem("consultationHistory")

        const doctor = localStorage.getItem("doctorInfo");
        if (!doctor) {
          console.log("doctor not found");

          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          console.log("token not found");

          return;
        }

        const res = await fetch(
          `http://localhost:4000/api/consultations/doctor/${doctorInfo?.licenseNumber}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let storedConsultations = await res.json();

        console.log(storedConsultations.data);

        if (storedConsultations.data) {
          const parsedConsultations = storedConsultations.data;
          setConsultationHistory(parsedConsultations);
        }
      } catch (error) {
        console.error("Error loading consultation history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, [setConsultationHistory]);

  // Format prescriptions for display
  const formatPrescription = (prescriptions: Prescription[]): string => {
    if (!prescriptions || prescriptions.length === 0)
      return "No medications prescribed";

    return prescriptions.map((p) => `${p.name} (${p.quantity})`).join(", ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Patient History
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Dr. {doctorInfo.name} | {doctorInfo.specialization}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {consultationHistory.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <FileX2 className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Consultation Records
              </h3>
              <p className="text-gray-500 max-w-md">
                You haven't completed any patient consultations yet. Records
                will appear here after you finish consultations with patients.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Symptoms</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Prescription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultationHistory.map((consultation, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {consultation.patientName}
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(consultation.date))}
                    </TableCell>
                    <TableCell>{consultation.symptoms}</TableCell>
                    <TableCell>{consultation.diagnosis}</TableCell>
                    <TableCell>
                      {formatPrescription(consultation.prescription)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {consultationHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Consultations
                </p>
                <p className="text-2xl font-bold">
                  {consultationHistory.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Last Consultation
                </p>
                <p className="text-lg font-medium">
                  {consultationHistory.length > 0
                    ? formatDate(new Date(consultationHistory[0].date)).split(
                        ","
                      )[0]
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Pill className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Prescriptions Given
                </p>
                <p className="text-2xl font-bold">
                  {consultationHistory.reduce(
                    (total, consultation) =>
                      total + (consultation.prescription?.length || 0),
                    0
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
