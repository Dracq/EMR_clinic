"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Plus, User as UserIcon, Calendar, Activity, ChevronRight, FileText } from "lucide-react";
import api from "@/lib/axios";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["patients", debouncedSearch],
    queryFn: async () => {
      const res = await api.get("/api/patients", { params: { search: debouncedSearch } });
      return res.data;
    },
  });

  return (
    <AuthGuard>
      <AppShell>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Patients</h1>
              <p className="text-gray-500">Manage your clinic's patients.</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => window.location.href = "/patients/new"}>
              <Plus className="w-4 h-4 mr-2" />
              New Patient
            </Button>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or UHID..."
              className="pl-10 h-11 border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 flex items-center justify-between h-24 bg-gray-50"></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {data?.patients?.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No patients found</h3>
                  <p className="mt-1 text-gray-500">
                    {search ? "No patients matched your search." : "Get started by adding a new patient."}
                  </p>
                  {!search && (
                    <Button className="mt-4" variant="outline" onClick={() => window.location.href = "/patients/new"}>
                      Add Patient
                    </Button>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {data?.patients?.map((patient: any) => (
                    <li key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <Link href={`/patients/${patient.id}`} className="block p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="hidden sm:flex h-12 w-12 rounded-full bg-indigo-50 items-center justify-center text-indigo-700 font-bold">
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900">{patient.name}</h3>
                                {patient.is_vip && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 text-xs py-0">VIP</Badge>}
                                {patient.is_high_risk && <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 text-xs py-0">High Risk</Badge>}
                              </div>
                              <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                                <span>{patient.uhid}</span>
                                <span>•</span>
                                <span>{patient.phone}</span>
                                <span>•</span>
                                <span>{patient.age} Y / {patient.gender.charAt(0)}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
