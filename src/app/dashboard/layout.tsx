"use client";
import { useKit } from "@/context/DoctorContext";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useEffect } from "react";

import { io } from "socket.io-client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    patientsList,
    setPatientsList,
    notificationsList,
    setNotificationsList,
    socket,
    setSocket,
  } = useKit();
  const router = useRouter();

  useEffect(() => {
    const socket = io("http://localhost:4000");
    setSocket(socket);
  }, []);

  useEffect(() => {
    console.log(socket);
  }, [socket]);

  useEffect(() => {
    const handleIncomingCall = ({ signal, patient }: any) => {
      setPatientsList((prev) => [...prev, patient]);
      console.log("incoming call", patient);

      setNotificationsList((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          message: `New patient request from ${patient.name}`,
          read: false,
        },
      ]);
    };

    socket?.on("connect", () => {
      console.log("connected", socket?.id);

      socket?.on("incoming-call", handleIncomingCall);
    });

    return () => {
      socket?.off("incoming-call", handleIncomingCall);
    };
  }, [socket]);

  useEffect(() => {
    const validUser = localStorage.getItem("token");
    if (!validUser) {
      router.push("/login");
    }
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
