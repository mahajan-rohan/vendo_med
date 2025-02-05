"use client";
import { useKit } from "@/context/DoctorContext";
import { Bell } from "lucide-react";

export default function Notifications() {
  const { notificationsList, setNotificationsList } = useKit();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
      <div className="space-y-4">
        {notificationsList.map((notification) => (
          <div
            key={notification.id}
            className="bg-white p-4 rounded-lg shadow-md flex items-start"
          >
            <Bell className="text-blue-500 mr-3 mt-1" size={20} />
            <div>
              <p className="text-gray-800">{notification.message}</p>
              <p className="text-sm text-gray-500">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
