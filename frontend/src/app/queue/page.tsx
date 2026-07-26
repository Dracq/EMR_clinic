"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, CheckCircle2, User as UserIcon, Play, AlertCircle, Phone } from "lucide-react";
import api from "@/lib/axios";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QueuePage() {
  const [statusFilter, setStatusFilter] = useState<string>("WAITING");

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ["appointments-today", statusFilter],
    queryFn: async () => {
      const res = await api.get("/api/appointments", {
        params: {
          date: format(new Date(), "yyyy-MM-dd"),
          status: statusFilter === "ALL" ? undefined : statusFilter,
        }
      });
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/api/appointments/${id}/status`, { status: newStatus });
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING": return <Badge className="bg-orange-100 text-orange-800 border-0">Waiting</Badge>;
      case "IN_CONSULTATION": return <Badge className="bg-blue-100 text-blue-800 border-0 animate-pulse">In Consultation</Badge>;
      case "COMPLETED": return <Badge className="bg-green-100 text-green-800 border-0">Completed</Badge>;
      case "CANCELLED": return <Badge className="bg-red-100 text-red-800 border-0">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Today's Queue</h1>
              <p className="text-gray-500">Manage patient flow for {format(new Date(), "MMMM do, yyyy")}.</p>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="WAITING">Waiting</SelectItem>
                  <SelectItem value="IN_CONSULTATION">In Consultation</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/appointments/new">Add Walk-in</Link>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse h-24 bg-gray-50 border-0"></Card>
              ))}
            </div>
          ) : appointments?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Queue is empty</h3>
              <p className="mt-1 text-gray-500">There are no patients matching the current filter.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments?.map((apt: any) => (
                <Card key={apt.id} className={`border-l-4 shadow-sm ${
                  apt.status === "WAITING" ? "border-l-orange-400" :
                  apt.status === "IN_CONSULTATION" ? "border-l-blue-500" :
                  apt.status === "COMPLETED" ? "border-l-green-500" : "border-l-gray-300"
                }`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                          {apt.patient_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/patients/${apt.patient_id}`} className="font-semibold text-lg text-gray-900 hover:text-indigo-600 transition-colors">
                              {apt.patient_name}
                            </Link>
                            {getStatusBadge(apt.status)}
                            {apt.type === "WALK_IN" && <Badge variant="outline" className="text-xs">Walk-in</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{apt.patient_uhid}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {apt.patient_phone}</span>
                            <span>•</span>
                            <span>{apt.time_slot ? apt.time_slot : "Unscheduled"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {apt.status === "WAITING" && (
                          <Button 
                            size="sm" 
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 flex-1 md:flex-none border border-blue-200"
                            onClick={() => updateStatus(apt.id, "IN_CONSULTATION")}
                          >
                            <Play className="w-4 h-4 mr-1" /> Start Consult
                          </Button>
                        )}
                        
                        {apt.status === "IN_CONSULTATION" && (
                          <Button 
                            size="sm" 
                            className="bg-green-50 text-green-700 hover:bg-green-100 flex-1 md:flex-none border border-green-200"
                            onClick={() => updateStatus(apt.id, "COMPLETED")}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                          </Button>
                        )}

                        <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none">
                          <Link href={`/patients/${apt.patient_id}`}>View File</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
