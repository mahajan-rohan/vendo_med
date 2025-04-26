"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Peer, { type SignalData } from "simple-peer";
import LoadingAnimation from "./LoadingAnimation";
import VideoCallInterface from "./VideoCallInterface";
import { useKit } from "@/context/DoctorContext";

interface callType {
  id: number;
  patientId?: string;
  name: string;
  age: number;
  symptoms: string;
  urgency: string;
  signal: string | SignalData;
}

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
  signal?: string | SignalData;
}

export default function PatientRequests() {
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(
    null
  );
  const { patientsList, setPatientsList, socket, doctorInfo } = useKit();
  const [completedRequests, setCompletedRequests] = useState<callType[]>([]);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [paymentQrImage, setPaymentQrImage] = useState<string | null>(null);

  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const answerCall = (patient: callType) => {
    setSelectedPatient({
      ...patient,
      medicinesAvailable: [
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
      ],
    });
    setIsWaiting(false);
    setIsLoading(true);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on("signal", (data) => {
          socket?.emit("accept-call", { signal: data, doctorId: socket.id });
        });

        peer.signal(patient.signal);

        peer.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }

          setIsLoading(false);
          setIsConnected(true);
        });

        peer.on("error", (err) => {
          console.error("Peer error", err);
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  };

  const endCall = () => {
    if (selectedPatient) {
      // Notify the server to end the call
      socket?.emit("end-call", { patientId: selectedPatient.patientId });

      if (remoteVideoRef.current?.srcObject) {
        const stream = remoteVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        remoteVideoRef.current.srcObject = null;
      }

      // End the call locally
      setIsConnected(false);
      setIsWaiting(true);
      setCompletedRequests((prev) => [...prev, selectedPatient as callType]);
      setPatientsList((prev) =>
        prev.filter((patient) => patient.id !== selectedPatient.id)
      );
      setSelectedPatient(null);
    }
  };

  useEffect(() => {
    console.log(doctorInfo);
  }, [doctorInfo]);

  useEffect(() => {
    if (socket) {
      socket.emit("doctor-online");
    }
  }, [socket]);

  useEffect(() => {
    socket?.on("receive-image", (data) => {
      if (data.patientId === selectedPatient?.patientId) {
        console.log("Received Payment QR Image:", data.image);
        setPaymentQrImage(data.image); // Display the image on the patient side
      }
    });

    return () => {
      socket?.off("receive-image");
    };
  }, [socket, selectedPatient]);

  return (
    <div>
      {isWaiting && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {patientsList.length > 0 ? (
            patientsList.map((patient, index) => (
              <div
                key={index}
                className="transition-all duration-300 ease-in-out"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{patient.name}</CardTitle>
                    <CardDescription>Age: {patient.age}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      <strong>Symptoms:</strong> {patient.symptoms}
                    </p>
                    <p>
                      <strong>Urgency:</strong> {patient.urgency}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        answerCall(patient);
                      }}
                    >
                      Start Consultation
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center p-10">
              <div className="text-4xl font-bold text-gray-300 mb-4">
                No Patient Requests
              </div>
              <p className="text-gray-500">
                Waiting for patients to request a consultation...
              </p>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center min-h-screen h-full w-full">
          <LoadingAnimation />
        </div>
      )}

      <div
        className={`flex flex-col items-center ${
          isConnected ? "block" : "hidden"
        }`}
      >
        <VideoCallInterface
          localVideoRef={myVideoRef}
          remoteVideoRef={remoteVideoRef}
          patientName={selectedPatient?.name || "Patient"}
          onEndCall={endCall}
          isDoctor={true}
          patientData={selectedPatient}
        />
      </div>

      {paymentQrImage && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Payment QR Code</h3>
          <img
            src={paymentQrImage}
            alt="Payment QR Code"
            className="max-h-48 rounded-lg mx-auto object-contain"
          />
        </div>
      )}
    </div>
  );
}
