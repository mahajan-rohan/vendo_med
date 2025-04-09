import { type RefObject, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Pill } from "lucide-react";
import { MedicineList } from "./MedicineList";
import { io } from "socket.io-client"; // Import socket.io-client

const socket = io("http://localhost:4000"); // Replace with your backend URL

interface Medicine {
  name: string;
  tablets: number;
  dosage: string;
  indications: string;
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

interface VideoCallInterfaceProps {
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  patientName: string;
  onEndCall: () => void;
  isDoctor?: boolean;
  patientData?: PatientData;
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

  const handlePrescribeMedicines = (prescriptions: { name: string; quantity: number }[]) => {
    // Emit the prescribed medicines to the vending machine
    socket.emit("prescribe-medicines", {
      patientId: patientData?.patientId,
      prescriptions,
    });
    console.log("Prescribed medicines sent:", prescriptions);
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
        {showMedicineList && (
          <motion.div
            className="absolute top-4 right-4 w-1/3 max-w-md z-10"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <MedicineList
              patientData={patientData}
              onPrescribe={handlePrescribeMedicines} // Pass the handler to MedicineList
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
        <Button variant="destructive" size="icon" onClick={onEndCall}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
