"use client";

import type React from "react";

import { type RefObject, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Pill,
  QrCode,
} from "lucide-react";
import { MedicineList } from "./MedicineList";
import { io } from "socket.io-client";
import { useKit } from "@/context/DoctorContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [paymentQrImage, setPaymentQrImage] = useState<string | null>(null);
  const { doctorInfo, setConsultationHistory } = useKit();
  const { toast } = useToast();

  // New states for payment confirmation
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [pendingPrescriptions, setPendingPrescriptions] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [showQrCode, setShowQrCode] = useState(false);

  // Default QR code image (a dummy/placeholder QR code)
  const dummyQrCode =
    "data:image/webp;base64,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";
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

  useEffect(() => {
    // Listen for the received image from the server
    socket.on("receive-image", (data) => {
      if (data.patientId === patientData?.patientId) {
        console.log("Received Payment QR Image:", data.image);
        setPaymentQrImage(data.image); // Display the image on the vending machine side
      }
    });

    return () => {
      socket.off("receive-image");
    };
  }, [patientData]);

  // Create a patient data object with medicines if not provided
  const enhancedPatientData = patientData
    ? {
        ...patientData,
        medicinesAvailable:
          patientData.medicinesAvailable || medicinesAvailable,
      }
    : null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target?.result as string;
        setPaymentQrImage(base64Image);

        console.log(base64Image);

        // Emit the image to the server
        socket.emit("send-image", {
          patientId: patientData?.patientId,
          image: base64Image,
        });
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (isDoctor) {
      // For doctors, we store the prescriptions in a pending state and show confirmation dialog
      setPendingPrescriptions(prescriptions);
      setShowPaymentConfirmation(true);
    } else {
      // For non-doctors (patients/vending machine), we just save the prescriptions
      // This branch likely won't be used but keeping it for completeness
      setPrescribedMedicines(prescriptions);
    }
  };

  // Function to confirm payment and send prescriptions
  const confirmPaymentAndSendPrescription = () => {
    // Save the pending prescriptions to the actual prescriptions state
    setPrescribedMedicines(pendingPrescriptions);

    // Emit the prescribed medicines to the vending machine
    socket.emit("prescribe-medicines", {
      patientId: patientData?.patientId,
      prescriptions: pendingPrescriptions,
    });

    console.log("Prescribed medicines sent:", pendingPrescriptions);

    // Close the confirmation dialog
    setShowPaymentConfirmation(false);

    // Notify the user
    toast({
      title: "Prescription Sent",
      description: "The prescription has been sent to the patient.",
    });
  };

  // Function to toggle QR code display for patients
  const toggleQrCode = () => {
    setShowQrCode(!showQrCode);
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
        className="absolute bottom-4 left-4 w-1/4 min-w-[120px] max-w-[240px] aspect-video z-10"
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

      {/* Payment Confirmation Dialog for Doctors */}
      <Dialog
        open={showPaymentConfirmation}
        onOpenChange={setShowPaymentConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Confirmation</DialogTitle>
            <DialogDescription>
              Have you received the payment from the patient on your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentConfirmation(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmPaymentAndSendPrescription}>
              Confirm & Send Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog for Patients */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to make your payment
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img
              src={dummyQrCode || "/placeholder.svg"}
              alt="Payment QR Code"
              className="max-w-[300px] max-h-[300px] flex z-50 object-fit-contain"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQrCode(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showMedicineList && enhancedPatientData && (
          <motion.div
            className="absolute top-4 right-4 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 max-h-[90vh] overflow-auto z-10"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <MedicineList
              patientData={enhancedPatientData}
              onPrescribe={handlePrescribeMedicines}
              onDiagnosisChange={(value: string) => setDiagnosis(value)}
              paymentQrImage={paymentQrImage}
              setPaymentQrImage={setPaymentQrImage}
              handleImageUpload={handleImageUpload}
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
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-2 sm:space-x-4"
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
        {!isDoctor && (
          <Button variant="outline" size="icon" onClick={toggleQrCode}>
            <QrCode className="h-4 w-4" />
          </Button>
        )}
        <Button variant="destructive" size="icon" onClick={handleEndCall}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
