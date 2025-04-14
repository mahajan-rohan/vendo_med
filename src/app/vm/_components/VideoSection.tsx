"use client";

import LoadingAnimation from "@/components/LoadingAnimation";
import { Button } from "@/components/ui/button";
import VideoCallInterface from "@/components/VideoCallInterface";
import { Video, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { io } from "socket.io-client";
import Peer from "simple-peer";
import PatientInfoForm, { type PatientFormData } from "./PatientInfoForm";
import { useVendingMachine } from "@/context/VendingMachineContext";
import { Badge } from "@/components/ui/badge";

function VideoSection({ socket }: { socket: ReturnType<typeof io> }) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientFormData | null>(null);
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [doctorCount, setDoctorCount] = useState<number>(0);
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
        socket.off("doctor-accepted");
        socket.on("doctor-accepted", ({ signal }) => {
          peer.signal(signal);
        });

        socket.off("vending-machine-update");
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

  useEffect(() => {
    socket.off("update-doctor-count");
    socket.on("update-doctor-count", (count: number) => {
      setDoctorCount(count);
    });

    return () => {
      socket.off("update-doctor-count");
    };
  }, [socket]);

  // Function to determine the availability status and color
  const getDoctorAvailabilityStatus = () => {
    if (doctorCount === 0) {
      return {
        status: "No doctors available",
        color: "bg-red-100 text-red-800 border-red-300",
        waitTime: "Long wait expected",
      };
    } else if (doctorCount === 1) {
      return {
        status: "1 doctor available",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        waitTime: "Moderate wait expected",
      };
    } else if (doctorCount < 4) {
      return {
        status: `${doctorCount} doctors available`,
        color: "bg-green-100 text-green-800 border-green-300",
        waitTime: "Short wait expected",
      };
    } else {
      return {
        status: `${doctorCount} doctors available`,
        color: "bg-green-100 text-green-800 border-green-300",
        waitTime: "Minimal wait expected",
      };
    }
  };

  const { status, color, waitTime } = getDoctorAvailabilityStatus();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {isWaiting && !showForm && !isLoading && (
        <div className="flex flex-col items-center space-y-6 p-8">
          <h1 className="text-3xl font-bold text-primary mb-4">
            MediVend Health Station
          </h1>

          {/* Doctor Availability Card */}
          <div className="w-full max-w-md mb-2">
            <div
              className={`rounded-lg border p-4 ${color} transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" />
                  <span className="font-medium">{status}</span>
                </div>
                <Badge variant="outline" className={color}>
                  {waitTime}
                </Badge>
              </div>

              {doctorCount > 0 ? (
                <div className="mt-3 flex justify-center">
                  <div className="flex space-x-1">
                    {[...Array(Math.min(doctorCount, 5))].map((_, i) => (
                      <div
                        key={i}
                        className="h-2 w-8 rounded-full bg-current opacity-80"
                      />
                    ))}
                    {[...Array(Math.max(5 - Math.min(doctorCount, 5), 0))].map(
                      (_, i) => (
                        <div
                          key={i}
                          className="h-2 w-8 rounded-full bg-current opacity-20"
                        />
                      )
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm">
                  You can still submit your information and will be connected
                  when a doctor becomes available.
                </p>
              )}
            </div>
          </div>

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
          <p className="text-sm text-muted-foreground mt-2">
            {doctorCount > 0
              ? `${doctorCount} ${
                  doctorCount === 1 ? "doctor" : "doctors"
                } currently available`
              : "Waiting for a doctor to become available"}
          </p>
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
