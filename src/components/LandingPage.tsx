import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { useState } from "react";

export default function LandingPage() {
  // const [isloading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600 flex items-center">
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
          </div>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              Login
            </Link>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-6 py-12 items-center justify-center h-screen">
        <div className="text-center h-full w-full items-center justify-center  flex flex-col">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4 transition-all duration-300 ease-in-out">
            Revolutionizing Telemedicine
          </h1>
          <p className="text-xl text-gray-600 mb-8 transition-all duration-300 ease-in-out">
            Connect with patients instantly, diagnose accurately, and prescribe
            efficiently.
          </p>
          <div className="transition-all duration-300 ease-in-out">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>

      <section>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              title: "Instant Consultations",
              description:
                "Connect with patients in real-time through our advanced video calling system.",
            },
            {
              title: "Smart Diagnostics",
              description:
                "Leverage our AI-powered system to assist in accurate diagnoses.",
            },
            {
              title: "Secure Prescriptions",
              description:
                "Generate secure QR codes for prescriptions, ensuring patient safety and convenience.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-6 text-center text-gray-600">
          © 2023 TeleMed Connect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
