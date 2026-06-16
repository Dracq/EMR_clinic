"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Clock,
  IndianRupee,
  UserPlus,
  CalendarPlus,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PageLoading } from "@/components/shared/loading-spinner";

interface DashboardStats {
  todayAppointments: number;
  waitingCount: number;
  completedCount: number;
  todayRevenue: number;
  recentPatients: Array<{
    id: string;
    uhid: string;
    name: string;
    phone: string;
    createdAt: string;
  }>;
  totalPatients: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  const role = session?.user?.role;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            {role === "DOCTOR"
              ? "Overview of today's consultations"
              : "Overview of today's clinic activity"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/patients/new">
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Patient</span>
            </Button>
          </Link>
          <Link href="/appointments/new">
            <Button size="sm">
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Appointment</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card group">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Appointments</p>
                <p className="text-3xl font-bold mt-1">{stats?.todayAppointments || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-3xl font-bold mt-1">{stats?.waitingCount || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-t-xl" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold mt-1">{stats?.completedCount || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card group">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-t-xl" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.todayRevenue || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IndianRupee className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href="/patients/new">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <span className="text-xs">Register Patient</span>
              </Button>
            </Link>
            <Link href="/appointments/new">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <CalendarPlus className="h-5 w-5 text-emerald-600" />
                <span className="text-xs">Book Appointment</span>
              </Button>
            </Link>
            <Link href="/patients">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="h-5 w-5 text-violet-600" />
                <span className="text-xs">Search Patients</span>
              </Button>
            </Link>
            <Link href="/appointments">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                <span className="text-xs">Today&apos;s Schedule</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Patients</CardTitle>
            <Link href="/patients">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentPatients?.length ? (
                stats.recentPatients.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {patient.uhid} • {patient.phone}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(patient.createdAt)}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No patients registered yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total patients */}
      <div className="text-center text-sm text-muted-foreground">
        Total registered patients: <span className="font-semibold text-foreground">{stats?.totalPatients || 0}</span>
      </div>
    </div>
  );
}
