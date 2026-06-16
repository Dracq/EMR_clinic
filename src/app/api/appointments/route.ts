import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { appointmentCreateSchema } from "@/lib/validations/appointment";
import { startOfDay, endOfDay } from "date-fns";

// GET /api/appointments - List appointments for a date
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  const patientId = searchParams.get("patientId");

  const where: Record<string, unknown> = {};

  if (dateStr) {
    const date = new Date(dateStr);
    where.date = {
      gte: startOfDay(date),
      lte: endOfDay(date),
    };
  }

  if (patientId) {
    where.patientId = patientId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      patient: {
        select: { id: true, uhid: true, name: true, age: true, gender: true, phone: true },
      },
      vital: true,
      consultation: { select: { id: true, diagnosis: true } },
      bill: { select: { id: true, totalAmount: true, paymentStatus: true } },
    },
  });

  return NextResponse.json(appointments);
}

// POST /api/appointments - Create appointment
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = appointmentCreateSchema.parse(body);

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        createdById: session.user.id,
      },
      include: {
        patient: { select: { name: true, uhid: true } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
