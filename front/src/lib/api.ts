/**

 * API client for communicating with the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentTime: Date;
  duration: number;
  status: string;
  notes?: string;
  remindersSent?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: Date;
}

export interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
}

export interface AppointmentWithDetails {
  appointment: Appointment;
  patient: Patient | null;
  doctor: Doctor | null;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetch('/health');
  }

  // Appointments
  async getAppointments(): Promise<{ appointments: AppointmentWithDetails[] }> {
    return this.fetch('/api/appointments');
  }

  async getUpcomingAppointments(): Promise<{ appointments: AppointmentWithDetails[] }> {
    return this.fetch('/api/appointments/upcoming');
  }

  async getAppointment(id: string): Promise<{ appointment: AppointmentWithDetails }> {
    return this.fetch(`/api/appointments/${id}`);
  }

  // Patients
  async getPatients(): Promise<{ patients: Patient[] }> {
    return this.fetch('/api/patients');
  }

  // Doctors
  async getDoctors(): Promise<{ doctors: Doctor[] }> {
    return this.fetch('/api/doctors');
  }
}

export const api = new ApiClient();

