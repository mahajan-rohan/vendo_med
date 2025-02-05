import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full fixed overflow-hidden">
      {/* Background with image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3836025.jpg-91ivBnITSjcWvtrzv49oIQdBohJFDg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* Content Container with hidden scrollbar */}
      <div
        className="relative z-10 h-screen w-full overflow-y-auto scrollbar-hide flex items-center justify-center px-4 py-8"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Form wrapper with max width for larger screens */}
        <div className="w-full max-w-md h-full">{children}</div>
      </div>
    </div>
  );
}
