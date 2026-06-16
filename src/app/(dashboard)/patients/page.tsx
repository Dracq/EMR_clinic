"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, UserPlus, Phone, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/shared/loading-spinner";
import { formatDate } from "@/lib/utils";

interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  createdAt: string;
  appointments: Array<{ date: string; status: string }>;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPatients = useCallback(async (searchTerm: string) => {
    setLoading(true);
    const res = await fetch(`/api/patients?search=${encodeURIComponent(searchTerm)}&limit=50`);
    const data = await res.json();
    setPatients(data.patients || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients("");
  }, [fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-description">{total} registered patients</p>
        </div>
        <Link href="/patients/new">
          <Button>
            <UserPlus className="h-4 w-4" />
            Register Patient
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or UHID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </div>

      {/* Patient List */}
      {loading ? (
        <PageLoading />
      ) : patients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {search ? "No patients match your search" : "No patients registered yet"}
            </p>
            {!search && (
              <Link href="/patients/new">
                <Button className="mt-4">
                  <UserPlus className="h-4 w-4" />
                  Register First Patient
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {patients.map((patient) => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{patient.name}</p>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {patient.uhid}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{patient.age}y / {patient.gender === "MALE" ? "M" : patient.gender === "FEMALE" ? "F" : "O"}</span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </span>
                        {patient.appointments[0] && (
                          <span>Last visit: {formatDate(patient.appointments[0].date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
