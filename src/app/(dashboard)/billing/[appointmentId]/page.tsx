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
import { Separator } from "@/components/ui/separator";
import { PageLoading } from "@/components/shared/loading-spinner";
import { BILL_ITEM_PRESETS, PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface BillRow { description: string; amount: number; quantity: number; }

export default function BillingPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<BillRow[]>([{ description: "Consultation Fee", amount: 500, quantity: 1 }]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentStatus, setPaymentStatus] = useState("PAID");

  useEffect(() => {
    fetch(`/api/appointments?date=`)
      .then((r) => r.json())
      .then((apts: any[]) => {
        const apt = apts.find((a: any) => a.id === appointmentId);
        if (apt) {
          setAppointment(apt);
          if (apt.bill?.items?.length) {
            setItems(apt.bill.items.map((i: any) => ({ description: i.description, amount: i.amount, quantity: i.quantity })));
          }
        }
        setLoading(false);
      });
  }, [appointmentId]);

  const addPreset = (preset: { description: string; amount: number }) => {
    setItems([...items, { ...preset, quantity: 1 }]);
  };
  const addRow = () => setItems([...items, { description: "", amount: 0, quantity: 1 }]);
  const removeRow = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateRow = (idx: number, key: keyof BillRow, val: string | number) => {
    const updated = [...items]; updated[idx] = { ...updated[idx], [key]: val }; setItems(updated);
  };

  const total = items.reduce((sum, i) => sum + i.amount * i.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.filter((i) => i.description && i.amount > 0).length) { toast.error("Add at least one item"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: appointment.patient.id, appointmentId,
          paymentMethod, paymentStatus,
          items: items.filter((i) => i.description && i.amount > 0),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Bill generated successfully");
      // Mark appointment as completed
      await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      router.push("/appointments");
    } catch { toast.error("Failed to generate bill"); }
    finally { setIsSubmitting(false); }
  };

  if (loading) return <PageLoading />;
  if (!appointment) return <div className="text-center py-12">Appointment not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/appointments"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div><h1 className="page-title">Billing</h1><p className="page-description">{appointment.patient.name} • {appointment.patient.uhid}</p></div>
        </div>
        <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>
      </div>

      {/* Quick Add Presets */}
      <div className="flex flex-wrap gap-2">
        {BILL_ITEM_PRESETS.map((preset) => (
          <Button key={preset.description} type="button" variant="outline" size="sm" onClick={() => addPreset(preset)}>
            <Plus className="h-3 w-3 mr-1" /> {preset.description} ({formatCurrency(preset.amount)})
          </Button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Bill Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRow}><Plus className="h-3 w-3 mr-1" /> Custom Item</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Input placeholder="Description" value={item.description} onChange={(e) => updateRow(idx, "description", e.target.value)} className="flex-1" />
                <Input type="number" placeholder="Amount" value={item.amount || ""} onChange={(e) => updateRow(idx, "amount", parseFloat(e.target.value) || 0)} className="w-24" />
                <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateRow(idx, "quantity", parseInt(e.target.value) || 1)} className="w-16" />
                <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeRow(idx)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 mt-6">
          <Link href="/appointments"><Button variant="outline" type="button">Cancel</Button></Link>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : `Generate Bill — ${formatCurrency(total)}`}</Button>
        </div>
      </form>
    </div>
  );
}
