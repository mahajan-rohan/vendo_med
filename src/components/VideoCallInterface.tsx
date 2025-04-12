"use client";

import { type RefObject, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Pill } from "lucide-react";
import { MedicineList } from "./MedicineList";
import { io } from "socket.io-client";
import { useKit } from "@/context/DoctorContext";
import { useToast } from "@/components/ui/use-toast";

const socket = io("http://localhost:4000");

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
  medicinesAvailable?: Medicine[];
  signal?: any;
}

interface VideoCallInterfaceProps {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  patientName: string;
  onEndCall: () => void;
  isDoctor?: boolean;
  patientData?: PatientData | null;
}

export default function VideoCallInterface({
  localVideoRef,
  remoteVideoRef,
  patientName,
  onEndCall,
  isDoctor = false,
  patientData,
}: VideoCallInterfaceProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showMedicineList, setShowMedicineList] = useState(false);
  const [prescribedMedicines, setPrescribedMedicines] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [diagnosis, setDiagnosis] = useState("");
  const { doctorInfo, setConsultationHistory } = useKit();
  const { toast } = useToast();

  // Get medicines from the vending machine context or use default
  const [medicinesAvailable, setMedicinesAvailable] = useState<Medicine[]>([
    {
      name: "Paracetamol",
      tablets: 10,
      dosage: "500mg",
      indications: "Fever, Pain relief",
    },
    {
      name: "Ibuprofen",
      tablets: 20,
      dosage: "400mg",
      indications: "Pain relief, Inflammation",
    },
    {
      name: "Amoxicillin",
      tablets: 15,
      dosage: "250mg",
      indications: "Bacterial infections",
    },
  ]);

  useEffect(() => {
    // If patient data has medicines available, use those
    if (patientData?.medicinesAvailable) {
      setMedicinesAvailable(patientData.medicinesAvailable);
    }
  }, [patientData]);

  const toggleMic = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn));
      setIsMicOn((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => (track.enabled = !isVideoOn));
      setIsVideoOn((prev) => !prev);
    }
  };

  const handlePrescribeMedicines = (
    prescriptions: { name: string; quantity: number }[]
  ) => {
    // Save the prescriptions to state
    setPrescribedMedicines(prescriptions);

    // Emit the prescribed medicines to the vending machine
    socket.emit("prescribe-medicines", {
      patientId: patientData?.patientId,
      prescriptions,
    });
    console.log("Prescribed medicines sent:", prescriptions);
  };

  const handleEndCall = async () => {
    // If doctor is ending the call, save the consultation
    if (isDoctor && patientData) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "User token not found. Please login again.",
          });
          return;
        }
        // Create a new consultation record
        const newConsultation = {
          id: `consultation-${Date.now()}`,
          patientName: patientData.name,
          patientId: patientData.patientId,
          date: new Date(),
          diagnosis: diagnosis || "General consultation",
          prescription: prescribedMedicines,
          symptoms: patientData.symptoms,
        };

        const consultation = {
          doctorId: doctorInfo?.id,
          licenseNumber: doctorInfo?.licenseNumber,
          patientId: patientData?.patientId,
          patientName: patientData?.name,
          diagnosis: diagnosis || "General consultation",
          prescription: prescribedMedicines.map((med) => ({
            name: med.name,
            quantity: med.quantity,
          })),
          symptoms: patientData?.symptoms || "",
        };

        // Add to local consultation history
        setConsultationHistory((prev) => [newConsultation, ...prev]);

        // Save to localStorage for persistence
        const storedConsultations = localStorage.getItem("consultationHistory");
        let consultations = [];

        if (storedConsultations) {
          try {
            consultations = JSON.parse(storedConsultations);
          } catch (error) {
            console.error("Error parsing stored consultations:", error);
          }
        }

        consultations.unshift(newConsultation);
        localStorage.setItem(
          "consultationHistory",
          JSON.stringify(consultations)
        );

        // Emit socket event for real-time updates
        socket.emit("end-call", {
          doctorId: doctorInfo.id,
          patientId: patientData.patientId,
          patientName: patientData.name,
          diagnosis: diagnosis || "General consultation",
          prescription: prescribedMedicines,
        });

        console.log({ ...consultation });

        const res = await fetch("http://localhost:4000/api/consultations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...consultation }),
        });

        const result = await res.json();
        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message,
          });
        } else {
          toast({
            title: "Consultation Saved",
            description: "The consultation was successfully recorded.",
          });
        }
      } catch (error) {
        console.error("Error saving consultation:", error);
        toast({
          title: "Error",
          description: "Failed to save consultation record.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }

    // Call the parent onEndCall function
    onEndCall();
  };

  // Create a patient data object with medicines if not provided
  const enhancedPatientData = patientData
    ? {
        ...patientData,
        medicinesAvailable:
          patientData.medicinesAvailable || medicinesAvailable,
      }
    : null;

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="fixed p-2 w-full h-full object-cover rounded-lg"
      />
      <motion.div
        className="absolute bottom-4 left-4 w-1/4 aspect-video z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover rounded-lg"
        />
      </motion.div>
      <AnimatePresence>
        {showMedicineList && enhancedPatientData && (
          <motion.div
            className="absolute top-4 right-4 w-1/3 max-w-md z-10"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <MedicineList
              patientData={enhancedPatientData}
              onPrescribe={handlePrescribeMedicines}
              onDiagnosisChange={(value: string) => setDiagnosis(value)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="absolute top-4 left-4 bg-black bg-opacity-50 p-2 rounded-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-white text-lg font-semibold">
          Call with {patientName}
        </h2>
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button variant="outline" size="icon" onClick={toggleMic}>
          {isMicOn ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={toggleVideo}>
          {isVideoOn ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </Button>
        {isDoctor && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowMedicineList(!showMedicineList)}
          >
            <Pill className="h-4 w-4" />
          </Button>
        )}
        <Button variant="destructive" size="icon" onClick={handleEndCall}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
