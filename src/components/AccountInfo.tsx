"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function AccountInfo() {
  const [doctorData, setDoctorData] = useState({
    name: "",
    specialization: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch doctor's data when the component mounts
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/doctors/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you store the token in localStorage
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch doctor data");
        }

        const data = await response.json();

        console.log(data);

        setDoctorData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  // Handle form submission to update doctor's data
  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/api/doctors/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming you store the token in localStorage
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        throw new Error("Failed to update doctor information");
      }

      let body = await response.json();

      localStorage.setItem("token", body.token);

      alert("Information updated successfully!");
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setDoctorData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Account Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={doctorData.name}
            onChange={handleChange}
            required
          />
        </div>
        {/* <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={doctorData.email}
            onChange={handleChange}
            required
          />
        </div> */}
        <div>
          <Label htmlFor="specialty">Specialty</Label>
          <Input
            id="specialization"
            value={doctorData.specialization}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="license">License Number</Label>
          <Input
            id="licenseNumber"
            value={doctorData.licenseNumber}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit">Update Information</Button>
      </form>
    </div>
  );
}
