import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { consultationCreateSchema } from "@/lib/validations/consultation";

// POST /api/consultations - Save consultation
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = consultationCreateSchema.parse(body);

    // Check if consultation already exists for this appointment
    const existing = await prisma.consultation.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existing) {
      const consultation = await prisma.consultation.update({
        where: { appointmentId: data.appointmentId },
        data: {
          ...data,
          doctorId: session.user.id,
        },
      });
      return NextResponse.json(consultation);
    }

    const consultation = await prisma.consultation.create({
      data: {
        ...data,
        doctorId: session.user.id,
      },
    });

    // Update appointment status to IN_CONSULTATION
    await prisma.appointment.update({
      where: { id: data.appointmentId },
      data: { status: "IN_CONSULTATION" },
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save consultation" }, { status: 500 });
  }
}
