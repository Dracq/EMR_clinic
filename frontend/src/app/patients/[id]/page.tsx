"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, FileText, Activity, CreditCard, Edit, Plus, Phone } from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/axios";

import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const res = await api.get(`/api/patients/${id}`);
      return res.data;
    },
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ["patient-timeline", id],
    queryFn: async () => {
      const res = await api.get(`/api/patients/${id}/timeline`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-100 rounded-xl"></div>
            <div className="h-64 bg-gray-100 rounded-xl"></div>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  if (!patient) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="text-center py-12">Patient not found</div>
        </AppShell>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6 pb-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Patient File</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push(`/appointments/new?patient_id=${id}`)}>
                <Calendar className="w-4 h-4 mr-2" /> Book Appointment
              </Button>
            </div>
          </div>

          {/* Patient Profile Card */}
          <Card className="border-0 shadow-md bg-white overflow-hidden">
            <div className="h-2 bg-indigo-600"></div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 text-2xl font-bold border-4 border-white shadow-sm">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                      {patient.is_vip && <Badge className="bg-amber-100 text-amber-800 border-0">VIP</Badge>}
                      {patient.is_high_risk && <Badge className="bg-red-100 text-red-800 border-0">High Risk</Badge>}
                    </div>
                    <div className="text-gray-500 flex items-center gap-2">
                      <span className="font-medium text-gray-900">{patient.uhid}</span>
                      <span>•</span>
                      <span>{patient.age} Years, {patient.gender}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {patient.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <Button variant="secondary" className="flex-1 md:flex-none bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100">
                    <Activity className="w-4 h-4 mr-2" /> Vitals
                  </Button>
                  <Button variant="secondary" className="flex-1 md:flex-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100">
                    <FileText className="w-4 h-4 mr-2" /> Consult
                  </Button>
                  <Button variant="secondary" className="flex-1 md:flex-none bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100">
                    <CreditCard className="w-4 h-4 mr-2" /> Bill
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Medical History</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{patient.medical_history || "None reported"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Allergies</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{patient.allergies || "None reported"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Details</h4>
                  <div className="space-y-1 text-sm text-gray-900">
                    <div className="flex justify-between"><span className="text-gray-500">Blood Group</span> <span className="font-medium">{patient.blood_group || "Unknown"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Registered On</span> <span>{format(new Date(patient.created_at), "MMM d, yyyy")}</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline and Details */}
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="bg-white border border-gray-200 h-12 w-full justify-start p-1 shadow-sm rounded-lg mb-6 overflow-x-auto flex-nowrap">
              <TabsTrigger value="timeline" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md px-6 py-2">Clinical Timeline</TabsTrigger>
              <TabsTrigger value="appointments" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md px-6 py-2">Appointments</TabsTrigger>
              <TabsTrigger value="investigations" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md px-6 py-2">Investigations</TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-md px-6 py-2">Files & Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="focus-visible:outline-none">
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">
                    Patient History
                    <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-2"/> Filter by Date</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {timelineLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="h-20 bg-gray-50 rounded-lg"></div>
                      <div className="h-20 bg-gray-50 rounded-lg"></div>
                    </div>
                  ) : timeline?.timeline?.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No clinical history found for this patient.
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-gray-100 ml-3 md:ml-6 space-y-8 pb-4">
                      {timeline?.timeline?.map((event: any, index: number) => (
                        <div key={index} className="relative pl-8 md:pl-10">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ring-4 ring-white ${
                            event.type === 'APPOINTMENT' ? 'bg-blue-500' :
                            event.type === 'CONSULTATION' ? 'bg-emerald-500' :
                            event.type === 'VITALS' ? 'bg-purple-500' :
                            event.type === 'PRESCRIPTION' ? 'bg-orange-500' :
                            event.type === 'BILLING' ? 'bg-indigo-500' : 'bg-gray-500'
                          }`}></div>
                          
                          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
                                  {event.type}
                                </Badge>
                                <span className="text-sm font-medium text-gray-900">{format(new Date(event.date), "MMM d, yyyy")}</span>
                              </div>
                              <span className="text-xs text-gray-400">{format(new Date(event.date), "h:mm a")}</span>
                            </div>
                            
                            <div className="text-gray-700 text-sm mt-3">
                              {event.type === 'APPOINTMENT' && (
                                <p>Status: <strong className="text-gray-900">{event.details.status}</strong></p>
                              )}
                              {event.type === 'VITALS' && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                  {event.details.bp && <div><span className="text-gray-500 text-xs block">BP</span> <span className="font-medium">{event.details.bp}</span></div>}
                                  {event.details.pulse && <div><span className="text-gray-500 text-xs block">Pulse</span> <span className="font-medium">{event.details.pulse} bpm</span></div>}
                                  {event.details.temperature && <div><span className="text-gray-500 text-xs block">Temp</span> <span className="font-medium">{event.details.temperature} °F</span></div>}
                                  {event.details.spo2 && <div><span className="text-gray-500 text-xs block">SpO2</span> <span className="font-medium">{event.details.spo2}%</span></div>}
                                </div>
                              )}
                              {event.type === 'CONSULTATION' && (
                                <div className="space-y-2">
                                  {event.details.symptoms && <p><span className="text-gray-500 font-medium">Symptoms:</span> {event.details.symptoms}</p>}
                                  {event.details.diagnosis && <p><span className="text-gray-500 font-medium">Diagnosis:</span> <span className="text-gray-900 font-semibold">{event.details.diagnosis}</span></p>}
                                </div>
                              )}
                              {event.type === 'BILLING' && (
                                <p>Amount: <strong className="text-gray-900">₹{event.details.total_amount}</strong> ({event.details.status})</p>
                              )}
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                View Details <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appointments">
              <Card className="border-0 shadow-sm p-12 text-center text-gray-500">
                Appointments content coming soon
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
