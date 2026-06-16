"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageLoading } from "@/components/shared/loading-spinner";
import type { AppointmentStatus } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ConsultationsListPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/appointments?date=${format(new Date(), "yyyy-MM-dd")}`)
      .then((r) => r.json())
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  const queue = appointments.filter((a: any) => a.status === "ARRIVED" || a.status === "IN_CONSULTATION");
  const completed = appointments.filter((a: any) => a.status === "COMPLETED" && a.consultation);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">Consultations</h1><p className="page-description">Today&apos;s consultation queue</p></div>

      {queue.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Queue ({queue.length})</h2>
          {queue.map((apt: any) => (
            <Link key={apt.id} href={`/consultations/${apt.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary">
                <CardContent className="flex items-center justify-between py-3 px-5">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <div><p className="font-medium text-sm">{apt.patient.name}</p><p className="text-xs text-muted-foreground">{apt.patient.uhid} • {apt.patient.age}y</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.vital && <Badge variant="secondary" className="text-[10px]">Vitals ✓</Badge>}
                    <StatusBadge status={apt.status as AppointmentStatus} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Completed Today ({completed.length})</h2>
          {completed.map((apt: any) => (
            <Card key={apt.id}>
              <CardContent className="flex items-center justify-between py-3 px-5">
                <div><p className="font-medium text-sm">{apt.patient.name}</p><p className="text-xs text-muted-foreground">{apt.consultation?.diagnosis || "No diagnosis"}</p></div>
                <StatusBadge status={apt.status as AppointmentStatus} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!queue.length && !completed.length && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No consultations for today</CardContent></Card>
      )}
    </div>
  );
}
