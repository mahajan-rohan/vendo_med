"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Peer, { SignalData } from "simple-peer";
import LoadingAnimation from "./LoadingAnimation";
import VideoCallInterface from "./VideoCallInterface";
import { QRCodeCanvas } from "qrcode.react";
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
  patientId: string;
  name: string;
  age: number;
  symptoms: string;
  urgency: string;
  medicinesAvailable: Medicine[];
}

export default function PatientRequests() {
  const [selectedPatient, setSelectedPatient] = useState<
    callType | PatientData | null
  >(null);
  const { patientsList, setPatientsList, socket } = useKit();
  const [completedRequests, setCompletedRequests] = useState<callType[]>([]);
  const [isWaiting, setIsWaiting] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const answerCall = (patient: callType) => {
    setSelectedPatient(patient);
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
          socket?.emit("accept-call", { signal: data });
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
    console.log(selectedPatient?.patientId);

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
      setCompletedRequests((prev) => [...prev, selectedPatient]);
      setPatientsList((prev) =>
        prev.filter((patient) => patient.id !== selectedPatient.id)
      );
      setSelectedPatient(null);
    }
  };

  return (
    <div>
      {isWaiting && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {patientsList.length > 0
            ? patientsList.map((patient, index) => (
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
                          setSelectedPatient(patient);
                          answerCall(patient);
                        }}
                      >
                        Start Consultation
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))
            : "no patient requests"}
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
          patientName={"Doctor"}
          onEndCall={endCall}
          // showQRCode={showQRCode}
          // setShowQRCode={setShowQRCode}
          isDoctor={true}
          patientData={selectedPatient}
        />
      </div>
    </div>
  );
}
