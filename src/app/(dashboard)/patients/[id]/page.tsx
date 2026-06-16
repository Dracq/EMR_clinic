"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, CalendarPlus, Phone, MapPin, Droplets, AlertTriangle, Heart, Stethoscope, Pill, FileText, Receipt, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageLoading } from "@/components/shared/loading-spinner";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { AppointmentStatus } from "@prisma/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setPatient)
      .catch(() => router.push("/patients"))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !patient) return <PageLoading />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <Link href="/patients"><Button variant="ghost" size="icon" className="mt-1"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{patient.name}</h1>
            <Badge variant="secondary">{patient.uhid}</Badge>
          </div>
          <p className="page-description">{patient.age}y / {patient.gender} • Registered {formatDate(patient.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/patients/${id}/edit`}><Button variant="outline" size="sm"><Edit className="h-4 w-4" /> Edit</Button></Link>
          <Link href={`/appointments/new?patientId=${id}`}><Button size="sm"><CalendarPlus className="h-4 w-4" /> Appointment</Button></Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{patient.phone}</div>
          {patient.address && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{patient.address}</div>}
        </CardContent></Card>
        <Card><CardContent className="p-4 space-y-2">
          {patient.bloodGroup && <div className="flex items-center gap-2 text-sm"><Droplets className="h-4 w-4 text-red-500" />Blood Group: <strong>{patient.bloodGroup}</strong></div>}
          {patient.allergies && <div className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-amber-500" /><span className="text-amber-700">{patient.allergies}</span></div>}
        </CardContent></Card>
        <Card><CardContent className="p-4 space-y-2">
          {patient.emergencyContact && <div className="text-sm"><p className="text-muted-foreground text-xs">Emergency Contact</p><p className="font-medium">{patient.emergencyContact}</p>{patient.emergencyPhone && <p className="text-xs">{patient.emergencyPhone}</p>}</div>}
        </CardContent></Card>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({patient.appointments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="space-y-4 mt-4">
          {patient.appointments.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No visit history yet</CardContent></Card>
          ) : (
            patient.appointments.map((apt: any) => (
              <Card key={apt.id} className="overflow-hidden">
                <CardHeader className="py-3 px-5 bg-muted/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-sm">{formatDate(apt.date)}</CardTitle>
                      <StatusBadge status={apt.status as AppointmentStatus} />
                    </div>
                    <div className="flex gap-1">
                      {(apt.status === "SCHEDULED" || apt.status === "ARRIVED") && (
                        <>
                          <Link href={`/vitals/${apt.id}`}><Button variant="outline" size="sm"><Activity className="h-3 w-3 mr-1" />Vitals</Button></Link>
                          <Link href={`/consultations/${apt.id}`}><Button variant="outline" size="sm"><Stethoscope className="h-3 w-3 mr-1" />Consult</Button></Link>
                        </>
                      )}
                      {apt.status !== "CANCELLED" && <Link href={`/billing/${apt.id}`}><Button variant="outline" size="sm"><Receipt className="h-3 w-3 mr-1" />Bill</Button></Link>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {apt.vital && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Heart className="h-3 w-3" /> Vitals</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                        {apt.vital.weight && <VitalChip label="Weight" value={`${apt.vital.weight} kg`} />}
                        {apt.vital.height && <VitalChip label="Height" value={`${apt.vital.height} cm`} />}
                        {apt.vital.bloodPressure && <VitalChip label="BP" value={apt.vital.bloodPressure} />}
                        {apt.vital.pulse && <VitalChip label="Pulse" value={`${apt.vital.pulse}/min`} />}
                        {apt.vital.temperature && <VitalChip label="Temp" value={`${apt.vital.temperature}°F`} />}
                        {apt.vital.spo2 && <VitalChip label="SpO2" value={`${apt.vital.spo2}%`} />}
                        {apt.vital.randomBloodSugar && <VitalChip label="RBS" value={`${apt.vital.randomBloodSugar}`} />}
                      </div>
                    </div>
                  )}
                  {apt.consultation && (<><Separator /><div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Stethoscope className="h-3 w-3" /> Consultation</h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      {apt.consultation.chiefComplaint && <div><span className="text-muted-foreground">Chief Complaint: </span>{apt.consultation.chiefComplaint}</div>}
                      {apt.consultation.diagnosis && <div><span className="text-muted-foreground">Diagnosis: </span><strong>{apt.consultation.diagnosis}</strong></div>}
                      {apt.consultation.advice && <div className="sm:col-span-2"><span className="text-muted-foreground">Advice: </span>{apt.consultation.advice}</div>}
                    </div>
                  </div></>)}
                  {apt.consultation?.prescription?.items?.length > 0 && (<><Separator /><div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Pill className="h-3 w-3" /> Prescription</h4>
                    {apt.consultation.prescription.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-sm"><span className="text-muted-foreground">{idx+1}.</span> <span className="font-medium">{item.medicineName}</span> {item.dosage && `— ${item.dosage}`} {item.frequency && `• ${item.frequency}`} {item.duration && `• ${item.duration}`}</div>
                    ))}
                    <Link href={`/prescriptions/${apt.consultation.id}`}><Button variant="outline" size="sm" className="mt-2"><FileText className="h-3 w-3 mr-1" />Print Rx</Button></Link>
                  </div></>)}
                  {apt.bill && (<><Separator /><div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><Receipt className="h-3 w-3" /> Bill</h4>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-semibold">{formatCurrency(apt.bill.totalAmount)}</span>
                      <Badge variant={apt.bill.paymentStatus === "PAID" ? "default" : "secondary"}>{apt.bill.paymentStatus}</Badge>
                    </div>
                  </div></>)}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="appointments" className="space-y-2 mt-4">
          {patient.appointments.map((apt: any) => (
            <Card key={apt.id}><CardContent className="flex items-center justify-between py-3 px-5">
              <div><p className="text-sm font-medium">{formatDate(apt.date)}</p><p className="text-xs text-muted-foreground">{apt.consultation?.diagnosis || "No diagnosis"}</p></div>
              <StatusBadge status={apt.status as AppointmentStatus} />
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VitalChip({ label, value }: { label: string; value: string }) {
  return (<div className="rounded-lg bg-muted/60 px-2.5 py-1.5 text-center"><p className="text-[10px] text-muted-foreground uppercase">{label}</p><p className="text-sm font-semibold">{value}</p></div>);
}
