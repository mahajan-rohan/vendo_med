"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { SignalData } from "simple-peer";
import type { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { usePathname } from "next/navigation";

interface callType {
  id: number;
  patientId?: string;
  name: string;
  age: number;
  symptoms: string;
  urgency: string;
  signal: string | SignalData;
}

interface Notification {
  id: number;
  message: string;
  read: boolean;
  time?: any;
}

interface DoctorInfo {
  id: string;
  name: string;
  specialization?: string;
  experience?: number;
  licenseNumber?: string | number;
  contact?: string;
  availabilityStart?: Date;
  availabilityEnd?: Date;
}

interface KitContextType {
  notificationsList: Notification[];
  setNotificationsList: React.Dispatch<React.SetStateAction<Notification[]>>;
  patientsList: callType[];
  setPatientsList: React.Dispatch<React.SetStateAction<callType[]>>;
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
  doctorInfo: DoctorInfo;
  setDoctorInfo: React.Dispatch<React.SetStateAction<DoctorInfo>>;
  fetchDoctorInfo: () => Promise<void>;
  consultationHistory: ConsultationRecord[];
  setConsultationHistory: React.Dispatch<
    React.SetStateAction<ConsultationRecord[]>
  >;
}

interface ConsultationRecord {
  id: string;
  patientName: string;
  patientId?: string;
  date: Date;
  diagnosis: string;
  prescription: { name: string; quantity: number }[];
  symptoms: string;
}

const Patients: callType[] = [];

// Generate a default doctor ID if none exists
const generateDoctorId = (): string => {
  // Check if we already have a doctor ID in localStorage
  const storedDoctorId = localStorage.getItem("doctorId");
  if (storedDoctorId) {
    return storedDoctorId;
  }

  // Generate a new ID if none exists
  const newDoctorId = uuidv4();
  localStorage.setItem("doctorId", newDoctorId);
  return newDoctorId;
};

// // Default doctor info
// const defaultDoctorInfo: DoctorInfo = {
//   id: generateDoctorId(),
//   name: "",
//   specialization: "General Medicine",
//   experience: 5,
//   licenseNumber: ""
// };

const KitContext = createContext<KitContextType | undefined>(undefined);

export const KitProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [notificationsList, setNotificationsList] = useState<Notification[]>(
    []
  );
  const [patientsList, setPatientsList] = useState(Patients);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [consultationHistory, setConsultationHistory] = useState<
    ConsultationRecord[]
  >([]);
  const pathname = usePathname();

  useEffect(() => {
    // Initialize doctorInfo on the client side
    const initializeDoctorInfo = () => {
      const storedDoctorId = generateDoctorId();
      setDoctorInfo({
        id: storedDoctorId,
        name: "",
        specialization: "General Medicine",
        experience: 5,
        licenseNumber: "",
      });
    };

    initializeDoctorInfo();
  }, []);

  // Load doctor info from localStorage on mount
  // useEffect(() => {
  //   const storedDoctorInfo = localStorage.getItem("doctorInfo");
  //   if (storedDoctorInfo) {
  //     try {
  //       const parsedInfo = JSON.parse(storedDoctorInfo);
  //       setDoctorInfo((prev) => ({
  //         ...prev,
  //         ...parsedInfo,
  //         id: prev.id, // Keep the ID from the default or generated
  //       }));
  //     } catch (error) {
  //       console.error("Error parsing stored doctor info:", error);
  //     }
  //   }
  // }, []);

  // Save doctor info to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("doctorInfo", JSON.stringify(doctorInfo));
  }, [doctorInfo]);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found. Please log in.");
          return;
        }

        const response = await fetch(
          "http://localhost:4000/api/doctors/details",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch doctor details");
        }

        const data = await response.json();
        setDoctorInfo({
          id: data._id,
          name: data.name,
          specialization: data.specialization,
          experience: data.experience,
          licenseNumber: data.licenseNumber,
          contact: data.contact,
          availabilityStart: new Date(data.availabilityStart),
          availabilityEnd: new Date(data.availabilityEnd),
        });
      } catch (error) {
        console.error("Error fetching doctor info:", error);
      }
    };
    if (pathname !== "/" && pathname !== "/vm") {
      fetchDoctorInfo();
    }
  }, []);

  return (
    <KitContext.Provider
      value={{
        notificationsList,
        setNotificationsList,
        patientsList,
        setPatientsList,
        socket,
        setSocket,
        doctorInfo,
        setDoctorInfo,
        consultationHistory,
        setConsultationHistory,
      }}
    >
      {children}
    </KitContext.Provider>
  );
};

export const useKit = () => {
  const context = useContext(KitContext);
  if (!context) throw new Error("useKit must be used within a KitProvider");
  return context;
};
