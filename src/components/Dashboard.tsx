"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

import Header from "./Header";
import PatientRequests from "./PatientRequests";
import MeetingList from "./MeetingList";
import Settings from "./Settings";
import Notifications from "./Notifications";
import AccountInfo from "./AccountInfo";
import PatientHistory from "./PatientHistory";
import VideoCall from "./VideoCall";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("requests");
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="flex h-screen">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeView === "requests" && (
            <PatientRequests
            // setSelectedPatient={setSelectedPatient}
            />
          )}
          {activeView === "meetings" && <MeetingList />}
          {activeView === "settings" && <Settings />}
          {activeView === "notifications" && <Notifications />}
          {activeView === "account" && <AccountInfo />}
          {activeView === "history" && <PatientHistory />}
          {selectedPatient && (
            <VideoCall
              patient={selectedPatient}
              onClose={() => setSelectedPatient(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
