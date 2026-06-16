"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/shared/loading-spinner";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function VitalsPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ weight: "", height: "", bloodPressure: "", pulse: "", temperature: "", spo2: "", randomBloodSugar: "" });

  useEffect(() => {
    fetch(`/api/appointments?date=`)
      .then((r) => r.json())
      .then((apts: any[]) => {
        const apt = apts.find((a: any) => a.id === appointmentId);
        if (apt) {
          setAppointment(apt);
          if (apt.vital) {
            setForm({
              weight: apt.vital.weight?.toString() || "",
              height: apt.vital.height?.toString() || "",
              bloodPressure: apt.vital.bloodPressure || "",
              pulse: apt.vital.pulse?.toString() || "",
              temperature: apt.vital.temperature?.toString() || "",
              spo2: apt.vital.spo2?.toString() || "",
              randomBloodSugar: apt.vital.randomBloodSugar?.toString() || "",
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
      const res = await fetch("/api/vitals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: appointment.patient.id,
          appointmentId,
          weight: form.weight ? parseFloat(form.weight) : null,
          height: form.height ? parseFloat(form.height) : null,
          bloodPressure: form.bloodPressure || null,
          pulse: form.pulse ? parseInt(form.pulse) : null,
          temperature: form.temperature ? parseFloat(form.temperature) : null,
          spo2: form.spo2 ? parseInt(form.spo2) : null,
          randomBloodSugar: form.randomBloodSugar ? parseFloat(form.randomBloodSugar) : null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Vitals recorded successfully");
      // Mark as arrived if scheduled
      if (appointment.status === "SCHEDULED") {
        await fetch(`/api/appointments/${appointmentId}/status`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "ARRIVED" }),
        });
      }
      router.push("/appointments");
    } catch { toast.error("Failed to save vitals"); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return <PageLoading />;
  if (!appointment) return <div className="text-center py-12">Appointment not found</div>;

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/appointments"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="page-title">Record Vitals</h1><p className="page-description">{appointment.patient.name} • {appointment.patient.uhid}</p></div>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle className="text-base">Vital Signs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" step="0.1" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="kg" /></div>
              <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" step="0.1" value={form.height} onChange={(e) => update("height", e.target.value)} placeholder="cm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Blood Pressure</Label><Input value={form.bloodPressure} onChange={(e) => update("bloodPressure", e.target.value)} placeholder="120/80" /></div>
              <div className="space-y-2"><Label>Pulse (bpm)</Label><Input type="number" value={form.pulse} onChange={(e) => update("pulse", e.target.value)} placeholder="bpm" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Temp (°F)</Label><Input type="number" step="0.1" value={form.temperature} onChange={(e) => update("temperature", e.target.value)} placeholder="°F" /></div>
              <div className="space-y-2"><Label>SpO2 (%)</Label><Input type="number" value={form.spo2} onChange={(e) => update("spo2", e.target.value)} placeholder="%" /></div>
              <div className="space-y-2"><Label>RBS</Label><Input type="number" step="0.1" value={form.randomBloodSugar} onChange={(e) => update("randomBloodSugar", e.target.value)} placeholder="mg/dL" /></div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/appointments"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Vitals"}</Button>
        </div>
      </form>
    </div>
  );
}
