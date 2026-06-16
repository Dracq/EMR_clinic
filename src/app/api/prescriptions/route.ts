import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { prescriptionCreateSchema } from "@/lib/validations/prescription";

// POST /api/prescriptions - Save prescription
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = prescriptionCreateSchema.parse(body);

    // Check if prescription already exists for this consultation
    const existing = await prisma.prescription.findUnique({
      where: { consultationId: data.consultationId },
    });

    if (existing) {
      // Delete old items and update
      await prisma.prescriptionItem.deleteMany({
        where: { prescriptionId: existing.id },
      });

      const prescription = await prisma.prescription.update({
        where: { id: existing.id },
        data: {
          doctorId: session.user.id,
          items: {
            create: data.items.map((item, index) => ({
              ...item,
              sortOrder: index,
            })),
          },
        },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });

      return NextResponse.json(prescription);
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: data.patientId,
        consultationId: data.consultationId,
        doctorId: session.user.id,
        items: {
          create: data.items.map((item, index) => ({
            ...item,
            sortOrder: index,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 });
  }
}

// GET /api/prescriptions?consultationId=xxx
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const consultationId = searchParams.get("consultationId");

  if (!consultationId) {
    return NextResponse.json({ error: "consultationId required" }, { status: 400 });
  }

  const prescription = await prisma.prescription.findUnique({
    where: { consultationId },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      patient: true,
      consultation: true,
      doctor: { select: { name: true } },
    },
  });

  return NextResponse.json(prescription);
}
