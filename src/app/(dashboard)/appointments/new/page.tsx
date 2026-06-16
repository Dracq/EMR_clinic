"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function NewAppointmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");
  const [patientId, setPatientId] = useState(preselectedPatientId || "");
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preselectedPatientId) {
      fetch(`/api/patients/${preselectedPatientId}`)
        .then((r) => r.json())
        .then((p) => { setSelectedPatient(p); setPatientId(p.id); });
    }
  }, [preselectedPatientId]);

  useEffect(() => {
    if (search.length < 2) return;
    const timer = setTimeout(() => {
      fetch(`/api/patients?search=${encodeURIComponent(search)}&limit=5`)
        .then((r) => r.json())
        .then((d) => setPatients(d.patients || []));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) { toast.error("Please select a patient"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, date: new Date(date).toISOString(), timeSlot, notes }),
      });
      if (!res.ok) throw new Error();
      toast.success("Appointment created");
      router.push("/appointments");
    } catch { toast.error("Failed to create appointment"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/appointments"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="page-title">New Appointment</h1><p className="page-description">Book an appointment for a patient</p></div>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle className="text-base">Appointment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!selectedPatient ? (
              <div className="space-y-2">
                <Label>Search Patient *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name, phone, or UHID" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" autoFocus />
                </div>
                {patients.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {patients.map((p: any) => (
                      <button key={p.id} type="button" className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm cursor-pointer" onClick={() => { setSelectedPatient(p); setPatientId(p.id); setPatients([]); setSearch(""); }}>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.uhid} • {p.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                <div><p className="font-medium text-sm">{selectedPatient.name}</p><p className="text-xs text-muted-foreground">{selectedPatient.uhid}</p></div>
                <Button variant="ghost" size="sm" type="button" onClick={() => { setSelectedPatient(null); setPatientId(""); }}>Change</Button>
              </div>
            )}
            <div className="space-y-2"><Label htmlFor="date">Date *</Label><Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="timeSlot">Time Slot</Label><Input id="timeSlot" placeholder="e.g., 10:00 AM" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="notes">Notes</Label><Input id="notes" placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/appointments"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Booking...</> : "Book Appointment"}</Button>
        </div>
      </form>
    </div>
  );
}

export default function NewAppointmentPage() {
  return <Suspense><NewAppointmentForm /></Suspense>;
}
