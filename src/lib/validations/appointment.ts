import { z } from "zod";

export const appointmentCreateSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  date: z.coerce.date(),
  timeSlot: z.string().optional(),
  notes: z.string().optional(),
});

export const appointmentUpdateSchema = appointmentCreateSchema.partial();

export const appointmentStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "ARRIVED", "IN_CONSULTATION", "COMPLETED", "CANCELLED"]),
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentStatusInput = z.infer<typeof appointmentStatusSchema>;
