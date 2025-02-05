import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

const mockMeetings = [
  { id: 1, patientName: "Alice Brown", date: "2023-06-15", time: "10:00 AM" },
  { id: 2, patientName: "Charlie Davis", date: "2023-06-15", time: "2:30 PM" },
  { id: 3, patientName: "Eva Fisher", date: "2023-06-16", time: "11:15 AM" },
];

export default function MeetingList() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Upcoming Meetings
      </h2>
      {mockMeetings.map((meeting) => (
        <div
          key={meeting.id}
        >
          <Card>
            <CardHeader>
              <CardTitle>{meeting.patientName}</CardTitle>
              <CardDescription>
                {meeting.date} at {meeting.time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Click to join the meeting when it's time.</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
