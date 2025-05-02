"use client";
import { useKit } from "@/context/DoctorContext";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
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

  const [canPlaySound, setCanPlaySound] = useState(false);

  // ✅ Wait for first user interaction to allow audio
  useEffect(() => {
    const enableSound = () => {
      setCanPlaySound(true);
      window.removeEventListener("click", enableSound);
      window.removeEventListener("keydown", enableSound);
    };

    window.addEventListener("click", enableSound);
    window.addEventListener("keydown", enableSound);

    return () => {
      window.removeEventListener("click", enableSound);
      window.removeEventListener("keydown", enableSound);
    };
  }, []);

  // 🔌 Initialize socket connection
  useEffect(() => {
    const socket = io("http://localhost:4000");
    setSocket(socket);
  }, []);

  useEffect(() => {
    const handleIncomingCall = ({ signal, patient }: any) => {
      setPatientsList((prev) => [...prev, patient]);

      setNotificationsList((prev) => {
        if (canPlaySound) {
          const bell = new Audio("/sounds/bell.mp3");
          bell.play().catch((err) => {
            console.error("🔇 Failed to play bell:", err);
          });
        }

        return [
          ...prev,
          {
            id: prev.length + 1,
            message: `New patient request from ${patient.name}`,
            read: false,
          },
        ];
      });
    };

    if (socket) {
      socket.on("connect", () => {
        socket.on("incoming-call", handleIncomingCall);
      });
    }

    return () => {
      socket?.off("incoming-call", handleIncomingCall);
    };
  }, [socket, canPlaySound, notificationsList]);

  useEffect(() => {
    const validUser = localStorage.getItem("token");
    if (!validUser) {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const unreadCount = notificationsList.filter((n) => !n.read).length;
    document.title = unreadCount > 0 ? `(${unreadCount}) VendoMed` : "VendoMed";
  }, [notificationsList]);

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
