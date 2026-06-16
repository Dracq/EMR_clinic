"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Manage clinic settings and user accounts</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Clinic Information</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Clinic Name:</span> <strong>Patkar Clinic</strong></div>
          <div><span className="text-muted-foreground">Doctor:</span> <strong>Dr. Vikrant Patkar</strong></div>
          <div><span className="text-muted-foreground">Location:</span> <strong>Palghar, Maharashtra</strong></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Default Login Credentials</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-3 gap-4 font-mono text-xs bg-muted/50 rounded-lg p-4">
            <div><p className="text-muted-foreground font-sans text-xs mb-1">Admin</p><p>admin@patkar.clinic</p><p>admin123</p></div>
            <div><p className="text-muted-foreground font-sans text-xs mb-1">Doctor</p><p>doctor@patkar.clinic</p><p>doctor123</p></div>
            <div><p className="text-muted-foreground font-sans text-xs mb-1">Receptionist</p><p>receptionist@patkar.clinic</p><p>reception123</p></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Change these credentials in production.</p>
        </CardContent>
      </Card>
    </div>
  );
}
