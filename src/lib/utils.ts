import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface generateQrCodeProps {
  amount?: number;
  patientId?: string;
}

export async function generateQrCode({
  amount = 1,
  patientId = "doctor",
}: generateQrCodeProps) {
  try {
    // Forward request to backend server
    console.log("Qr code");

    const response = await fetch("http://localhost:4000/api/generatePayment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, patientId }),
    });

    console.log(response);
    const result = await response.json();
    console.log(result);

    return result;
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return { error: "Failed to fetch QR code" };
  }
}
