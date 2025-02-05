"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Bell,
  Settings,
  User,
  ClipboardList,
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Requests", href: "/dashboard" },
    // { icon: Calendar, label: "Meetings", href: "/dashboard/meetings" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    { icon: User, label: "Account", href: "/dashboard/account" },
    {
      icon: ClipboardList,
      label: "Patient History",
      href: "/dashboard/history",
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-md transition-transform duration-300 ease-in-out">
      <div className="p-4">
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 64 64"
            fill="none"
            className="mr-2"
          >
            <circle cx="32" cy="32" r="30" fill="#3B82F6" />
            <path
              d="M20 32C20 25.3726 25.3726 20 32 20C38.6274 20 44 25.3726 44 32C44 38.6274 38.6274 44 32 44"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M32 32L38 26"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="32" r="3" fill="white" />
          </svg>
          TeleMed Connect
        </Link>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center w-full px-4 py-2 text-left transition-all duration-200 ease-in-out ${
                pathname === item.href
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="mr-2" size={20} />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
