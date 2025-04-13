// Add this new file for type definitions
export interface Notification {
  id: number;
  message: string;
  read: boolean;
  time?: string;
}

export interface DoctorInfo {
  id: string;
  name: string;
  specialization?: string;
  experience?: number;
  licenseNumber?: string | number;
  contact?: string;
  availabilityStart?: Date;
  availabilityEnd?: Date;
}

export interface PatientCall {
  id: number;
  patientId?: string;
  name: string;
  age: number;
  symptoms: string;
  urgency: string;
  signal: any;
}

export interface ConsultationRecord {
  id: string;
  patientName: string;
  patientId?: string;
  date: Date;
  diagnosis: string;
  prescription: { name: string; quantity: number }[];
  symptoms: string;
}
