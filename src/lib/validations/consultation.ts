import { z } from "zod";

export const consultationCreateSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().min(1, "Appointment is required"),
  chiefComplaint: z.string().optional().nullable(),
  symptoms: z.string().optional().nullable(),
  clinicalFindings: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  advice: z.string().optional().nullable(),
  followUpDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ConsultationCreateInput = z.infer<typeof consultationCreateSchema>;
