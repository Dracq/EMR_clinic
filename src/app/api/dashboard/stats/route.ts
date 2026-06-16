import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

// GET /api/dashboard/stats
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const [
    todayAppointments,
    waitingCount,
    completedCount,
    todayRevenue,
    recentPatients,
    totalPatients,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        date: { gte: dayStart, lte: dayEnd },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.appointment.count({
      where: {
        date: { gte: dayStart, lte: dayEnd },
        status: "ARRIVED",
      },
    }),
    prisma.appointment.count({
      where: {
        date: { gte: dayStart, lte: dayEnd },
        status: "COMPLETED",
      },
    }),
    prisma.bill.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: dayStart, lte: dayEnd },
        paymentStatus: "PAID",
      },
    }),
    prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, uhid: true, name: true, phone: true, createdAt: true },
    }),
    prisma.patient.count(),
  ]);

  return NextResponse.json({
    todayAppointments,
    waitingCount,
    completedCount,
    todayRevenue: todayRevenue._sum.totalAmount || 0,
    recentPatients,
    totalPatients,
  });
}
