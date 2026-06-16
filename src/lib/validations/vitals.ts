import { z } from "zod";

export const vitalsCreateSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().min(1, "Appointment is required"),
  weight: z.coerce.number().positive().optional().nullable(),
  height: z.coerce.number().positive().optional().nullable(),
  bloodPressure: z.string().optional().nullable(),
  pulse: z.coerce.number().int().positive().optional().nullable(),
  temperature: z.coerce.number().positive().optional().nullable(),
  spo2: z.coerce.number().int().min(0).max(100).optional().nullable(),
  randomBloodSugar: z.coerce.number().positive().optional().nullable(),
});

export type VitalsCreateInput = z.infer<typeof vitalsCreateSchema>;
