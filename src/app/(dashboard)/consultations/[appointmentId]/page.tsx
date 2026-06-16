"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageLoading } from "@/components/shared/loading-spinner";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ConsultationPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    chiefComplaint: "", symptoms: "", clinicalFindings: "",
    diagnosis: "", advice: "", followUpDate: "", notes: "",
  });

  useEffect(() => {
    fetch(`/api/appointments?date=`)
      .then((r) => r.json())
      .then((apts: any[]) => {
        const apt = apts.find((a: any) => a.id === appointmentId);
        if (apt) {
          setAppointment(apt);
          if (apt.consultation) {
            setForm({
              chiefComplaint: apt.consultation.chiefComplaint || "",
              symptoms: apt.consultation.symptoms || "",
              clinicalFindings: apt.consultation.clinicalFindings || "",
              diagnosis: apt.consultation.diagnosis || "",
              advice: apt.consultation.advice || "",
              followUpDate: apt.consultation.followUpDate?.split("T")[0] || "",
              notes: apt.consultation.notes || "",
            });
          }
        }
        setLoading(false);
      });
  }, [appointmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: appointment.patient.id, appointmentId,
          ...form,
          followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error();
      const consultation = await res.json();
      toast.success("Consultation saved");
      router.push(`/prescriptions/${consultation.id}`);
    } catch { toast.error("Failed to save consultation"); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return <PageLoading />;
  if (!appointment) return <div className="text-center py-12">Appointment not found</div>;

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/appointments"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="page-title">Consultation</h1><p className="page-description">{appointment.patient.name} • {appointment.patient.uhid} • {appointment.patient.age}y/{appointment.patient.gender}</p></div>
      </div>

      {/* Vitals summary if available */}
      {appointment.vital && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recorded Vitals</h3>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center">
              {appointment.vital.weight && <div><p className="text-[10px] text-muted-foreground">Weight</p><p className="text-sm font-semibold">{appointment.vital.weight} kg</p></div>}
              {appointment.vital.bloodPressure && <div><p className="text-[10px] text-muted-foreground">BP</p><p className="text-sm font-semibold">{appointment.vital.bloodPressure}</p></div>}
              {appointment.vital.pulse && <div><p className="text-[10px] text-muted-foreground">Pulse</p><p className="text-sm font-semibold">{appointment.vital.pulse}/min</p></div>}
              {appointment.vital.temperature && <div><p className="text-[10px] text-muted-foreground">Temp</p><p className="text-sm font-semibold">{appointment.vital.temperature}°F</p></div>}
              {appointment.vital.spo2 && <div><p className="text-[10px] text-muted-foreground">SpO2</p><p className="text-sm font-semibold">{appointment.vital.spo2}%</p></div>}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle className="text-base">Clinical Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Chief Complaint</Label><Textarea value={form.chiefComplaint} onChange={(e) => update("chiefComplaint", e.target.value)} placeholder="Patient's main complaint" rows={2} autoFocus /></div>
            <div className="space-y-2"><Label>Symptoms</Label><Textarea value={form.symptoms} onChange={(e) => update("symptoms", e.target.value)} placeholder="Described symptoms" rows={2} /></div>
            <div className="space-y-2"><Label>Clinical Findings</Label><Textarea value={form.clinicalFindings} onChange={(e) => update("clinicalFindings", e.target.value)} placeholder="Examination findings" rows={2} /></div>
            <Separator />
            <div className="space-y-2"><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => update("diagnosis", e.target.value)} placeholder="Primary diagnosis" /></div>
            <div className="space-y-2"><Label>Advice</Label><Textarea value={form.advice} onChange={(e) => update("advice", e.target.value)} placeholder="Advice to patient" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Follow-up Date</Label><Input type="date" value={form.followUpDate} onChange={(e) => update("followUpDate", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Additional notes" rows={2} /></div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/appointments"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save & Write Prescription →"}</Button>
        </div>
      </form>
    </div>
  );
}
