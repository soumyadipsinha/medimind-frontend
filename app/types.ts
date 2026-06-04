export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
  avatarUrl?: string;
  profile?: any;
}

export interface Department {
  _id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
}

export interface Service {
  _id: string;
  name: string;
  department?: { _id: string; name: string };
  price: number;
  description: string;
  reportDeliveryTime: string;
}

export interface Doctor {
  _id: string;
  user?: { _id: string; name: string; email: string; avatarUrl?: string; isActive?: boolean; lastSeen?: string };
  qualification: string;
  specialization: string;
  experience: number;
  registrationNumber: string;
  consultationFee: number;
  availableDays: string[];
  startTime: string;
  endTime: string;
  maxPatientsPerDay: number;
  bio?: string;
}

export interface Appointment {
  _id: string;
  patient?: { _id: string; user?: { name: string; email: string; avatarUrl?: string } };
  doctor?: { _id: string; user?: { name: string; email: string; avatarUrl?: string }; specialization?: string; consultationFee?: number };
  department?: { name: string };
  date: string;
  timeSlot: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Refunded";
  fee: number;
}
