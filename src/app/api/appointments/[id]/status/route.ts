import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { appointmentStatusSchema } from "@/lib/validations/appointment";

// PATCH /api/appointments/[id]/status - Update appointment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = appointmentStatusSchema.parse(body);

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: { select: { name: true, uhid: true } },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
