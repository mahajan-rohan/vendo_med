"use client";

import { SetStateAction, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DoctorLogin() {
  const [doctorId, setDoctorId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/api/doctors/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseNumber: doctorId, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      console.log("Doctor logged in:", data);
      localStorage.setItem("token", data.token);
      setError(null);
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Card className="shadow-xl my-auto h-full flex flex-col">
      <h1 className="text-3xl font-bold text-center mb-6 mt-auto">
        Doctor Log in
      </h1>
      <CardContent className="pt-6 mb-auto">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor ID</Label>
              <Input
                id="doctorId"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button type="submit" className="w-full mt-6">
            Log in
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
