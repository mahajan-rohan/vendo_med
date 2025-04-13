// "use client";

// import { useEffect, useRef } from "react";
// import { useKit } from "@/context/DoctorContext";

// export default function NotificationManager() {
//   const { notificationsList } = useKit();
//   const originalTitle = useRef(document.title || "Doctor Dashboard");
//   const faviconRef = useRef<HTMLLinkElement | null>(null);

//   // Find and store reference to favicon
//   useEffect(() => {
//     faviconRef.current = document.querySelector('link[rel="icon"]');

//     // If no favicon exists, create one
//     if (!faviconRef.current) {
//       const link = document.createElement("link");
//       link.rel = "icon";
//       link.href = "/favicon.ico";
//       document.head.appendChild(link);
//       faviconRef.current = link;
//     }

//     return () => {
//       // Restore original title when component unmounts
//       document.title = originalTitle.current;
//     };
//   }, []);

//   // Update document title when notifications change
//   useEffect(() => {
//     const unreadCount = notificationsList.filter((n) => !n.read).length;

//     if (unreadCount > 0) {
//       // Update title with notification count
//       document.title = `(${unreadCount}) ${originalTitle.current}`;

//       // Optional: You could also change the favicon to indicate notifications
//       // if (faviconRef.current) {
//       //   faviconRef.current.href = '/notification-favicon.ico';
//       // }
//     } else {
//       // Restore original title when no unread notifications
//       document.title = originalTitle.current;

//       // Optional: Restore original favicon
//       // if (faviconRef.current) {
//       //   faviconRef.current.href = '/favicon.ico';
//       // }
//     }
//   }, [notificationsList]);

//   // This is a utility component with no UI
//   return null;
// }
