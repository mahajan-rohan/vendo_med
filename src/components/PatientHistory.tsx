import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

const mockPatientHistory = [
  {
    id: 1,
    name: "Alice Johnson",
    date: "2023-06-10",
    diagnosis: "Common Cold",
    prescription: "Rest and fluids",
  },
  {
    id: 2,
    name: "Bob Smith",
    date: "2023-06-09",
    diagnosis: "Sprained Ankle",
    prescription: "Ice and elevation",
  },
  {
    id: 3,
    name: "Carol Williams",
    date: "2023-06-08",
    diagnosis: "Migraine",
    prescription: "Painkillers and rest",
  },
];

export default function PatientHistory() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Patient History</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Prescription</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPatientHistory.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.name}</TableCell>
              <TableCell>{record.date}</TableCell>
              <TableCell>{record.diagnosis}</TableCell>
              <TableCell>{record.prescription}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
