"use client";

import { useKit } from "@/context/DoctorContext";
import PatientHistory from "../../../components/PatientHistory";

export default function HistoryPage() {
  const { doctorInfo } = useKit();

  return <PatientHistory doctorId={doctorInfo.id} />;
}
