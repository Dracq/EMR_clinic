"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/shared/loading-spinner";
import { formatCurrency, formatDate } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function BillingListPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/appointments?date=${format(new Date(), "yyyy-MM-dd")}`)
      .then((r) => r.json())
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  const withBills = appointments.filter((a: any) => a.bill);
  const withoutBills = appointments.filter((a: any) => !a.bill && a.status !== "CANCELLED" && a.status !== "SCHEDULED");

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">Billing</h1><p className="page-description">Today&apos;s billing summary</p></div>

      {withoutBills.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Pending Bills</h2>
          {withoutBills.map((apt: any) => (
            <Link key={apt.id} href={`/billing/${apt.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="flex items-center justify-between py-3 px-5">
                  <div><p className="font-medium text-sm">{apt.patient.name}</p><p className="text-xs text-muted-foreground">{apt.patient.uhid}</p></div>
                  <Badge variant="secondary">Generate Bill</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {withBills.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase">Today&apos;s Bills</h2>
          {withBills.map((apt: any) => (
            <Link key={apt.id} href={`/billing/${apt.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="flex items-center justify-between py-3 px-5">
                  <div><p className="font-medium text-sm">{apt.patient.name}</p><p className="text-xs text-muted-foreground">{apt.patient.uhid} • {formatDate(apt.date)}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{formatCurrency(apt.bill.totalAmount)}</span>
                    <Badge variant={apt.bill.paymentStatus === "PAID" ? "default" : "secondary"}>{apt.bill.paymentStatus}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!withBills.length && !withoutBills.length && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No billing activity for today</CardContent></Card>
      )}
    </div>
  );
}
