import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { patientCreateSchema } from "@/lib/validations/patient";
import { generateUHID } from "@/lib/utils";

// GET /api/patients - List/search patients
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
          { uhid: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        appointments: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true, status: true },
        },
      },
    }),
    prisma.patient.count({ where }),
  ]);

  return NextResponse.json({ patients, total, page, limit });
}

// POST /api/patients - Create patient
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = patientCreateSchema.parse(body);

    // Generate unique UHID
    let uhid = generateUHID();
    let existing = await prisma.patient.findUnique({ where: { uhid } });
    while (existing) {
      uhid = generateUHID();
      existing = await prisma.patient.findUnique({ where: { uhid } });
    }

    const patient = await prisma.patient.create({
      data: { ...data, uhid },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
