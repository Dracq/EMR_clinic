import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { vitalsCreateSchema } from "@/lib/validations/vitals";

// POST /api/vitals - Record vitals
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = vitalsCreateSchema.parse(body);

    // Check if vitals already exist for this appointment
    const existing = await prisma.vital.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existing) {
      // Update existing vitals
      const vital = await prisma.vital.update({
        where: { appointmentId: data.appointmentId },
        data: {
          ...data,
          recordedById: session.user.id,
        },
      });
      return NextResponse.json(vital);
    }

    const vital = await prisma.vital.create({
      data: {
        ...data,
        recordedById: session.user.id,
      },
    });

    return NextResponse.json(vital, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to record vitals" }, { status: 500 });
  }
}
