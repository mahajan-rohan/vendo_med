"use client";

import React, { createContext, useContext, useState } from "react";
import { SignalData } from "simple-peer";
import { Socket } from "socket.io-client";

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

interface KitContextType {
  notificationsList: Notification[];
  setNotificationsList: React.Dispatch<React.SetStateAction<Notification[]>>;
  patientsList: callType[];
  setPatientsList: React.Dispatch<React.SetStateAction<callType[]>>;
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
}

const Patients: callType[] = [];

const KitContext = createContext<KitContextType | undefined>(undefined);

export const KitProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [notificationsList, setNotificationsList] = useState<Notification[]>(
    []
  );
  const [patientsList, setPatientsList] = useState(Patients);
  const [socket, setSocket] = useState(null);

  return (
    <KitContext.Provider
      value={{
        notificationsList,
        setNotificationsList,
        patientsList,
        setPatientsList,
        socket,
        setSocket,
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
