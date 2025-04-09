"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function DoctorSignup() {
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    specialization: "",
    experience: "",
    contact: "",
    availabilityStart: "",
    availabilityEnd: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, specialization: value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";
    if (!formData.specialization)
      newErrors.specialization = "Specialization is required";
    if (!formData.experience)
      newErrors.experience = "Years of experience is required";
    else if (
      isNaN(Number(formData.experience)) ||
      Number(formData.experience) < 0
    )
      newErrors.experience = "Invalid experience";
    if (!formData.contact.trim())
      newErrors.contact = "Contact number is required";
    if (!formData.availabilityStart)
      newErrors.availabilityStart = "Availability start is required";
    if (!formData.availabilityEnd)
      newErrors.availabilityEnd = "Availability end is required";
    if (
      formData.availabilityStart &&
      formData.availabilityEnd &&
      new Date(formData.availabilityStart) >= new Date(formData.availabilityEnd)
    ) {
      newErrors.availabilityEnd = "End time must be after start time";
    }
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch(
          "http://localhost:4000/api/doctors/signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              licenseNumber: formData.licenseNumber,
              specialization: formData.specialization,
              experience: Number(formData.experience),
              contact: formData.contact,
              availabilityStart: formData.availabilityStart,
              availabilityEnd: formData.availabilityEnd,
              password: formData.password,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Signup failed");
        }

        setSuccessMessage("Doctor registered successfully!");
        // Optionally reset the form or redirect
        setFormData({
          name: "",
          licenseNumber: "",
          specialization: "",
          experience: "",
          contact: "",
          availabilityStart: "",
          availabilityEnd: "",
          password: "",
          confirmPassword: "",
        });

        const data = await response.json();
        console.log("Doctor Regiserd", data);
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } catch (error: any) {
        console.error("Error during signup:", error);
        setErrors({ general: error.message });
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-3xl font-bold text-center mb-6">Doctor sign up</h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
              {errors.licenseNumber && (
                <p className="text-sm text-red-500">{errors.licenseNumber}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general-practice">
                    General Practice
                  </SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                </SelectContent>
              </Select>
              {errors.specialization && (
                <p className="text-sm text-red-500">{errors.specialization}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={handleChange}
                required
              />
              {errors.experience && (
                <p className="text-sm text-red-500">{errors.experience}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                type="tel"
                value={formData.contact}
                onChange={handleChange}
                required
              />
              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityStart">Availability Start</Label>
              <Input
                id="availabilityStart"
                type="datetime-local"
                value={formData.availabilityStart}
                onChange={handleChange}
                required
              />
              {errors.availabilityStart && (
                <p className="text-sm text-red-500">
                  {errors.availabilityStart}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="availabilityEnd">Availability End</Label>
              <Input
                id="availabilityEnd"
                type="datetime-local"
                value={formData.availabilityEnd}
                onChange={handleChange}
                required
              />
              {errors.availabilityEnd && (
                <p className="text-sm text-red-500">{errors.availabilityEnd}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Display success message */}
            {successMessage && (
              <p className="text-sm text-green-500">{successMessage}</p>
            )}

            {/* Display general error message */}
            {errors.general && (
              <p className="text-sm text-red-500">{errors.general}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-6">
            Sign up
          </Button>
        </form>
      </CardContent>

      {/* Footer with login link */}
      <CardFooter>
        <p className="text-sm text-center w-full">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
