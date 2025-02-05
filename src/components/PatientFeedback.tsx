"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function PatientFeedback() {
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log("Feedback submitted:", feedback);
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    });
    setFeedback("");
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Patient Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="We value your feedback. Please share your thoughts on your recent telemedicine experience."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" className="mt-4">
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
