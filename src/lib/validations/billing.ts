import { z } from "zod";

export const billItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  quantity: z.coerce.number().int().positive().default(1),
});

export const billCreateSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().min(1, "Appointment is required"),
  paymentMethod: z.enum(["CASH", "UPI", "CARD"]).optional().nullable(),
  paymentStatus: z.enum(["PENDING", "PAID"]).default("PENDING"),
  items: z.array(billItemSchema).min(1, "At least one item is required"),
});

export type BillItemInput = z.infer<typeof billItemSchema>;
export type BillCreateInput = z.infer<typeof billCreateSchema>;
