import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { patientUpdateSchema } from "@/lib/validations/patient";

// GET /api/patients/[id] - Get patient with all relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { date: "desc" },
        include: {
          createdBy: { select: { name: true } },
          vital: true,
          consultation: {
            include: {
              doctor: { select: { name: true } },
              prescription: {
                include: { items: { orderBy: { sortOrder: "asc" } } },
              },
            },
          },
          investigations: true,
          bill: {
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json(patient);
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const data = patientUpdateSchema.parse(body);

    const patient = await prisma.patient.update({
      where: { id },
      data,
    });

    return NextResponse.json(patient);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}
