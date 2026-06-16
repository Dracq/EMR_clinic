import { z } from "zod";

export const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
});

export const prescriptionCreateSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  consultationId: z.string().min(1, "Consultation is required"),
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine is required"),
});

export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
export type PrescriptionCreateInput = z.infer<typeof prescriptionCreateSchema>;
