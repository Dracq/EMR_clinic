"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Upload, FileText, Image, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoading } from "@/components/shared/loading-spinner";
import { formatDate } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function InvestigationsPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = use(params);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchPatient = () => {
    fetch(`/api/patients/${patientId}`)
      .then((r) => r.json())
      .then(setPatient)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatient(); }, [patientId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) { toast.error("Title and file are required"); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", patientId);
      formData.append("title", title);
      const res = await fetch("/api/investigations/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      toast.success("Report uploaded");
      setTitle(""); setFile(null);
      fetchPatient();
    } catch { toast.error("Upload failed"); }
    finally { setIsUploading(false); }
  };

  if (loading) return <PageLoading />;
  if (!patient) return <div className="text-center py-12">Patient not found</div>;

  const investigations = patient.appointments?.flatMap((a: any) => a.investigations || []) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/patients/${patientId}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="page-title">Investigations</h1><p className="page-description">{patient.name} • {patient.uhid}</p></div>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader><CardTitle className="text-base">Upload Report</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2"><Label>Report Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Blood Test Report" /></div>
            <div className="space-y-2">
              <Label>File (PDF or Image) *</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <Button type="submit" disabled={isUploading}>{isUploading ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4" /> Upload Report</>}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader><CardTitle className="text-base">Report History</CardTitle></CardHeader>
        <CardContent>
          {investigations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No reports uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {investigations.map((inv: any) => (
                <a key={inv.id} href={inv.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {inv.fileType === "PDF" ? <FileText className="h-5 w-5 text-red-500" /> : <Image className="h-5 w-5 text-blue-500" />}
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{inv.title}</p><p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</p></div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
