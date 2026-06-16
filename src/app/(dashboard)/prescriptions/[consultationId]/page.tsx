"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2, Printer } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageLoading } from "@/components/shared/loading-spinner";
import { FREQUENCY_OPTIONS, DURATION_OPTIONS } from "@/lib/constants";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface MedicineRow {
  medicineName: string; dosage: string; frequency: string; duration: string; instructions: string;
}

const emptyRow = (): MedicineRow => ({ medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" });

export default function PrescriptionPage({ params }: { params: Promise<{ consultationId: string }> }) {
  const { consultationId } = use(params);
  const router = useRouter();
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicines, setMedicines] = useState<MedicineRow[]>([emptyRow()]);

  useEffect(() => {
    fetch(`/api/prescriptions?consultationId=${consultationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.items?.length) {
          setPrescription(data);
          setMedicines(data.items.map((i: any) => ({
            medicineName: i.medicineName, dosage: i.dosage || "", frequency: i.frequency || "",
            duration: i.duration || "", instructions: i.instructions || "",
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [consultationId]);

  const addRow = () => setMedicines([...medicines, emptyRow()]);
  const removeRow = (idx: number) => setMedicines(medicines.filter((_, i) => i !== idx));
  const updateRow = (idx: number, key: keyof MedicineRow, val: string) => {
    const updated = [...medicines]; updated[idx] = { ...updated[idx], [key]: val }; setMedicines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validMeds = medicines.filter((m) => m.medicineName.trim());
    if (!validMeds.length) { toast.error("Add at least one medicine"); return; }
    setIsSubmitting(true);
    try {
      const patientId = prescription?.patientId;
      if (!patientId) { toast.error("No patient associated"); return; }
      const res = await fetch("/api/prescriptions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, consultationId, items: validMeds }),
      });
      if (!res.ok) throw new Error();
      toast.success("Prescription saved");
      router.refresh();
      // After saving, could navigate to print or stay
    } catch { toast.error("Failed to save prescription"); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/appointments"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="page-title">Prescription</h1>
            {prescription?.patient && <p className="page-description">{prescription.patient.name} • {prescription.patient.uhid}</p>}
          </div>
        </div>
        {prescription?.items?.length > 0 && (
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Medicines</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRow}><Plus className="h-3 w-3 mr-1" /> Add Medicine</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicines.map((med, idx) => (
              <div key={idx} className="rounded-lg border p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Medicine #{idx + 1}</Label>
                  {medicines.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeRow(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <Input placeholder="Medicine name *" value={med.medicineName} onChange={(e) => updateRow(idx, "medicineName", e.target.value)} />
                  </div>
                  <Input placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={(e) => updateRow(idx, "dosage", e.target.value)} />
                  <Select value={med.frequency} onValueChange={(v) => updateRow(idx, "frequency", v)}>
                    <SelectTrigger><SelectValue placeholder="Frequency" /></SelectTrigger>
                    <SelectContent>{FREQUENCY_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={med.duration} onValueChange={(v) => updateRow(idx, "duration", v)}>
                    <SelectTrigger><SelectValue placeholder="Duration" /></SelectTrigger>
                    <SelectContent>{DURATION_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Instructions" value={med.instructions} onChange={(e) => updateRow(idx, "instructions", e.target.value)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/appointments"><Button variant="outline" type="button">Back</Button></Link>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Prescription"}</Button>
        </div>
      </form>
    </div>
  );
}
