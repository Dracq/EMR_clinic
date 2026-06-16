"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight, Activity, Stethoscope, Receipt } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageLoading } from "@/components/shared/loading-spinner";
import { toast } from "sonner";
import type { AppointmentStatus } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async (d: Date) => {
    setLoading(true);
    const res = await fetch(`/api/appointments?date=${format(d, "yyyy-MM-dd")}`);
    const data = await res.json();
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(date); }, [date]);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const res = await fetch(`/api/appointments/${id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Appointment ${status.toLowerCase().replace("_", " ")}`);
      fetchAppointments(date);
    }
  };

  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-description">{format(date, "EEEE, dd MMMM yyyy")}{isToday && " — Today"}</p>
        </div>
        <Link href="/appointments/new"><Button><CalendarPlus className="h-4 w-4" /> New Appointment</Button></Link>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setDate(subDays(date, 1))}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant={isToday ? "default" : "outline"} onClick={() => setDate(new Date())}>Today</Button>
        <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, 1))}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {loading ? <PageLoading /> : appointments.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No appointments for this day</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {appointments.map((apt: any) => (
            <Card key={apt.id} className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-primary">{apt.patient.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <Link href={`/patients/${apt.patient.id}`} className="font-medium text-sm hover:underline">{apt.patient.name}</Link>
                      <p className="text-xs text-muted-foreground">{apt.patient.uhid} • {apt.patient.age}y/{apt.patient.gender === "MALE" ? "M" : "F"} • {apt.patient.phone}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <StatusBadge status={apt.status} />
                        {apt.vital && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Vitals ✓</span>}
                        {apt.consultation && <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">Consulted ✓</span>}
                        {apt.bill && <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Billed ✓</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 shrink-0">
                    {apt.status === "SCHEDULED" && <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, "ARRIVED")}>Mark Arrived</Button>}
                    {apt.status === "ARRIVED" && (
                      <Link href={`/vitals/${apt.id}`}><Button size="sm" variant="outline"><Activity className="h-3 w-3 mr-1" />Vitals</Button></Link>
                    )}
                    {(apt.status === "ARRIVED" || apt.status === "IN_CONSULTATION") && (
                      <Link href={`/consultations/${apt.id}`}><Button size="sm"><Stethoscope className="h-3 w-3 mr-1" />Consult</Button></Link>
                    )}
                    {apt.status !== "CANCELLED" && apt.status !== "SCHEDULED" && (
                      <Link href={`/billing/${apt.id}`}><Button size="sm" variant="outline"><Receipt className="h-3 w-3 mr-1" />Bill</Button></Link>
                    )}
                    {(apt.status === "IN_CONSULTATION" || apt.status === "ARRIVED") && (
                      <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => updateStatus(apt.id, "COMPLETED")}>Complete</Button>
                    )}
                    {apt.status === "SCHEDULED" && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(apt.id, "CANCELLED")}>Cancel</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
