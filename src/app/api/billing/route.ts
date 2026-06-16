import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { billCreateSchema } from "@/lib/validations/billing";

// POST /api/billing - Create bill
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = billCreateSchema.parse(body);

    // Check if bill already exists for this appointment
    const existing = await prisma.bill.findUnique({
      where: { appointmentId: data.appointmentId },
    });

    if (existing) {
      await prisma.billItem.deleteMany({
        where: { billId: existing.id },
      });

      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.amount * (item.quantity || 1),
        0
      );

      const bill = await prisma.bill.update({
        where: { id: existing.id },
        data: {
          totalAmount,
          paymentStatus: data.paymentStatus,
          paymentMethod: data.paymentMethod,
          items: {
            create: data.items.map((item, index) => ({
              ...item,
              sortOrder: index,
            })),
          },
        },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });

      return NextResponse.json(bill);
    }

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.amount * (item.quantity || 1),
      0
    );

    const bill = await prisma.bill.create({
      data: {
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        totalAmount,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        createdById: session.user.id,
        items: {
          create: data.items.map((item, index) => ({
            ...item,
            sortOrder: index,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create bill" }, { status: 500 });
  }
}
