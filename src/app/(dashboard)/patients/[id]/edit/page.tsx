"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { patientCreateSchema, type PatientCreateInput } from "@/lib/validations/patient";
import { BLOOD_GROUPS, GENDER_OPTIONS } from "@/lib/constants";
import { PageLoading } from "@/components/shared/loading-spinner";

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<PatientCreateInput>({
    resolver: zodResolver(patientCreateSchema),
  });

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((r) => r.json())
      .then((p) => {
        reset({ name: p.name, age: p.age, gender: p.gender, phone: p.phone, address: p.address || "", bloodGroup: p.bloodGroup || "", allergies: p.allergies || "", emergencyContact: p.emergencyContact || "", emergencyPhone: p.emergencyPhone || "" });
        setLoading(false);
      });
  }, [id, reset]);

  const onSubmit = async (data: PatientCreateInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      toast.success("Patient updated successfully");
      router.push(`/patients/${id}`);
    } catch { toast.error("Failed to update patient"); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/patients/${id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="page-title">Edit Patient</h1><p className="page-description">Update patient information</p></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card><CardHeader><CardTitle className="text-base">Patient Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Full Name *</Label><Input id="name" {...register("name")} autoFocus />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
              <div className="space-y-2"><Label htmlFor="phone">Phone *</Label><Input id="phone" {...register("phone")} />{errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label htmlFor="age">Age *</Label><Input id="age" type="number" {...register("age")} />{errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}</div>
              <div className="space-y-2"><Label>Gender *</Label><Select onValueChange={(v) => setValue("gender", v as "MALE"|"FEMALE"|"OTHER")}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{GENDER_OPTIONS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Blood Group</Label><Select onValueChange={(v) => setValue("bloodGroup", v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="address">Address</Label><Textarea id="address" {...register("address")} rows={2} /></div>
            <div className="space-y-2"><Label htmlFor="allergies">Allergies</Label><Input id="allergies" {...register("allergies")} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="emergencyContact">Emergency Contact</Label><Input id="emergencyContact" {...register("emergencyContact")} /></div>
              <div className="space-y-2"><Label htmlFor="emergencyPhone">Emergency Phone</Label><Input id="emergencyPhone" {...register("emergencyPhone")} /></div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 mt-6">
          <Link href={`/patients/${id}`}><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
