"use client";

import LoadingAnimation from "@/components/LoadingAnimation";
import { Button } from "@/components/ui/button";
import VideoCallInterface from "@/components/VideoCallInterface";
import { Video } from "lucide-react";
import { useRef, useState } from "react";
import type { io } from "socket.io-client";
import Peer from "simple-peer";
import PatientInfoForm, { type PatientFormData } from "./PatientInfoForm";
import { useVendingMachine } from "@/context/VendingMachineContext";

function VideoSection({ socket }: { socket: ReturnType<typeof io> }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientFormData | null>(null);
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const { medicinesList } = useVendingMachine();

  const handleFormSubmit = (data: PatientFormData) => {
    setPatientInfo(data);
    setShowForm(false);
    setIsLoading(true);

    // Start the call with the form data
    initiateCall(data);
  };

  const initiateCall = (patientData: PatientFormData) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);

        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        const peer = new Peer({ initiator: true, trickle: false, stream });

        // Send the initial signal to the server
        peer.on("signal", (data) => {
          socket.emit("call-doctor", {
            signal: data,
            patient: {
              id: 3,
              patientId: socket.id,
              name: patientData.name,
              age: Number.parseInt(patientData.age),
              symptoms: patientData.symptoms,
              urgency: patientData.urgency,
              signal: data,
              medicinesAvailable: medicinesList.map((medicine: any) => ({
                name: medicine.name,
                tablets: medicine.tablets,
                dosage: medicine.dosage,
                indications: medicine.indications,
              })),
            },
          });
        });

        // Listen for the doctor's signal
        socket.on("doctor-accepted", ({ signal }) => {
          peer.signal(signal);
        });

        socket.on("vending-machine-update", (data) => {
          console.log("Received data for vending machine:", data);

          // Handle the data (e.g., dispense medicines)
        });

        // Stop the media stream and clean up
        socket.on("call-ended", () => {
          console.log("call ended");

          if (remoteVideoRef.current?.srcObject) {
            const stream = remoteVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            remoteVideoRef.current.srcObject = null;
          }

          // Update UI to reflect that the call has ended
          setIsConnected(false);
          setIsWaiting(true);
          setIsLoading(false);
          setPatientInfo(null);
        });

        // Handle the remote stream
        peer.on("stream", (remoteStream) => {
          // You can display the remote video using another video element
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = remoteStream;
          console.log("Remote stream received");
          setIsConnected(true);
          setIsLoading(false);
        });
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
        setIsLoading(false);
        setIsWaiting(true);
      });
  };

  const startCall = () => {
    setShowForm(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {isWaiting && !showForm && !isLoading && (
        <div className="flex flex-col items-center space-y-6 p-8">
          <h1 className="text-3xl font-bold text-primary mb-4">
            MediVend Health Station
          </h1>
          <p className="text-center text-muted-foreground mb-4">
            Connect with a healthcare professional via video call for a
            consultation
          </p>
          <Button onClick={startCall} size="lg" className="gap-2">
            <Video className="h-5 w-5" /> Start Video Call
          </Button>
        </div>
      )}

      {showForm && !isLoading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <PatientInfoForm
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {isLoading && !isConnected && (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingAnimation />
          <p className="mt-4 text-muted-foreground">Connecting to doctor...</p>
        </div>
      )}

      <div
        className={`flex justify-evenly w-full ${
          isConnected ? "block" : "hidden"
        }`}
      >
        <VideoCallInterface
          localVideoRef={myVideoRef}
          remoteVideoRef={remoteVideoRef}
          patientName={patientInfo?.name || "Patient"}
          onEndCall={() => {
            console.log("Call ended");
            setIsConnected(false);
            setIsWaiting(true);
            setPatientInfo(null);

            // Stop local stream
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
              setStream(null);
            }

            // Emit call-ended event to server
            socket.emit("end-call");
          }}
          isDoctor={false}
        />
      </div>
    </div>
  );
}

export default VideoSection;
