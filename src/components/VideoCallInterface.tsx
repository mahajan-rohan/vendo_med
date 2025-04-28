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
  Activity,
  Thermometer,
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
import { Progress } from "@/components/ui/progress";
import { useVendingMachine } from "@/context/VendingMachineContext";

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

  const [showHealthAnalysis, setShowHealthAnalysis] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [healthData, setHealthData] = useState<{
    temperature: number;
    heartRate: number;
  } | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  // Default QR code image (a dummy/placeholder QR code)
  const dummyQrCode =
    "https://pvccardprinting.in/wp-content/uploads/2023/12/gpay-qr-code.webp";
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
    if (isDoctor) {
      console.log("doc", socket.id);
    } else {
      console.log("pat", socket.id);
    }

    // Listen for the received image from the server
    socket.on("receive-image", (data) => {
      if (data.patientId === patientData?.patientId) {
        console.log("Received Payment QR Image:", data.image);
        setPaymentQrImage(data.image); // Display the image on the vending machine side
      }
    });

    // Add this new listener for health data
    if (isDoctor) {
      socket.on("health-data", (data) => {
        console.log("Received health readings:", data);

        // Show the health data panel
        setShowHealthAnalysis(true);
        setHealthData({...data});

        // Display a toast notification
        toast({
          title: "Health Data Received",
          description: `Patient's temperature: ${data.temperature}°C, Heart rate: ${data.pulse} BPM`,
          duration: 5000,
        });
      });
    }

    return () => {
      socket.off("receive-image");
      if (isDoctor) {
        socket.off("health-data");
      }
    };
  }, [patientData, isDoctor, doctorInfo, toast]);

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

  const handleHealthAnalysis = async () => {
    setShowHealthAnalysis(true);
    setIsScanning(true);
    setScanProgress(0);
  
    // ✨ Trigger the backend API to run script
    try {
      fetch('http://localhost:4000/api/start-script');
      console.log('Sensor script started successfully.');
    } catch (error) {
      console.error('Failed to start sensor script:', error);
    }
  
    // Continue your scanning animation
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
  
          // Generate random health data (or could be updated later from real sensor)
          const temperature = (36.5 + Math.random()).toFixed(1);
          const heartRate = Math.floor(60 + Math.random() * 40);
  
          const data = {
            temperature: Number.parseFloat(temperature),
            heartRate: heartRate,
          };
  
          setHealthData(data);
  
          socket.emit("health-data", {
            patientId: patientData?.patientId,
            doctorId: doctorInfo?.id,
            data: data,
          });
  
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };
  

  const handleEndCall = async () => {
    // If doctor is ending the call, save the consultation
    if (isDoctor && patientData) {

      try {
        fetch('http://localhost:4000/api/stop-script');
        console.log('Sensor script stopped.');
      } catch (error) {
        console.error('Failed to stop sensor script:', error);
      }
      
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
        {showHealthAnalysis && (
          <motion.div
            className="absolute top-4 left-4 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-black bg-opacity-80 rounded-lg p-4 z-10"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                Health Analysis
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHealthAnalysis(false)}
                className="text-white"
              >
                ✕
              </Button>
            </div>

            {isScanning ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-20">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <Activity className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
                <p className="text-white text-center">
                  Scanning vital signs...
                </p>
                <Progress value={scanProgress} className="h-2 bg-gray-700" />
              </div>
            ) : healthData ? (
              <div className="space-y-6 py-2">
                <div className="flex items-center space-x-4 bg-blue-900 bg-opacity-40 p-3 rounded-lg">
                  <Thermometer className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="text-gray-300 text-sm">Body Temperature</p>
                    <p className="text-white text-xl font-bold">
                      {healthData.temperature}°C
                    </p>
                    <p className="text-xs text-gray-400">
                      {healthData.temperature > 37.5
                        ? "Above normal"
                        : "Normal range"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-blue-900 bg-opacity-40 p-3 rounded-lg">
                  <Activity className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-gray-300 text-sm">Heart Rate</p>
                    <p className="text-white text-xl font-bold">
                      {healthData.heartRate} BPM
                    </p>
                    <p className="text-xs text-gray-400">
                      {healthData.heartRate > 100
                        ? "Elevated"
                        : healthData.heartRate < 60
                        ? "Below normal"
                        : "Normal range"}
                    </p>
                  </div>
                </div>

                <p className="text-center text-green-400 text-sm">
                  Health data sent to doctor
                </p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

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
        {!isDoctor && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleHealthAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Activity className="h-4 w-4" />
          </Button>
        )}
        <Button variant="destructive" size="icon" onClick={handleEndCall}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
