"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useKit } from "@/context/DoctorContext";

export default function Header() {
  const { notificationsList, setNotificationsList } = useKit();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notificationsList.filter(
    (n: (typeof notificationsList)[0]) => !n.read
  ).length;

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark all as read when opening
      setNotificationsList(
        notificationsList.map((n: (typeof notificationsList)[0]) => ({
          ...n,
          read: true,
        }))
      );
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex justify-between items-center transition-colors duration-200">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        Welcome, Dr. Developer
      </h2>
      <div className="relative">
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full relative"
          onClick={toggleNotifications}
        >
          <Bell size={24} className="text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
        {showNotifications && (
          <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto z-50 bg-white dark:bg-gray-700 shadow-lg rounded-md transition-all duration-200 ease-in-out">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Notifications
              </h3>
              {notificationsList.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-2 mb-2 rounded ${
                    notification.read
                      ? "bg-gray-100 dark:bg-gray-600"
                      : "bg-blue-100 dark:bg-blue-700"
                  }`}
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </header>
  );
}
