"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/api/dashboard/stats");
      return data;
    },
  });

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
              <p className="text-gray-500">Overview of today's clinical activity.</p>
            </div>
            <div className="text-sm font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              {format(new Date(), "EEEE, MMMM do, yyyy")}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-20 bg-gray-100"></CardHeader>
                  <CardContent className="h-24 bg-gray-50"></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Appointments Today</CardTitle>
                    <Calendar className="h-4 w-4 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats?.today_appointments || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Waiting in Queue</CardTitle>
                    <Activity className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats?.waiting_count || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Completed Consultations</CardTitle>
                    <Users className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats?.completed_count || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Today's Revenue</CardTitle>
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">₹{stats?.today_revenue || 0}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="col-span-1 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Patients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recent_patients?.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No recent patients found.</p>
                      )}
                      {stats?.recent_patients?.map((patient: any) => (
                        <div key={patient.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.uhid}</p>
                          </div>
                          <div className="text-sm text-gray-600">{patient.phone}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
