export const CLINIC_CONFIG = {
  name: process.env.CLINIC_NAME || "Patkar Clinic",
  doctorName: process.env.DOCTOR_NAME || "Dr. Vikrant Patkar",
  address: process.env.CLINIC_ADDRESS || "Palghar, Maharashtra",
  phone: process.env.CLINIC_PHONE || "",
  defaultConsultationFee: Number(process.env.DEFAULT_CONSULTATION_FEE) || 500,
};

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const;

export const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
] as const;

export const APPOINTMENT_STATUS_CONFIG = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", dotColor: "bg-blue-500" },
  ARRIVED: { label: "Arrived", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", dotColor: "bg-amber-500" },
  IN_CONSULTATION: { label: "In Consultation", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", dotColor: "bg-purple-500" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", dotColor: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", dotColor: "bg-red-500" },
} as const;

export const PAYMENT_METHODS = [
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Card", value: "CARD" },
] as const;

export const FREQUENCY_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "Before meals",
  "After meals",
  "At bedtime",
  "As needed (SOS)",
  "Once weekly",
] as const;

export const DURATION_OPTIONS = [
  "1 day",
  "2 days",
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "21 days",
  "1 month",
  "2 months",
  "3 months",
  "6 months",
  "Continue",
] as const;

export const BILL_ITEM_PRESETS = [
  { description: "Consultation Fee", amount: 500 },
  { description: "Injection Charges", amount: 100 },
  { description: "Dressing Charges", amount: 200 },
  { description: "ECG Charges", amount: 300 },
  { description: "Nebulization Charges", amount: 150 },
  { description: "Minor Procedure", amount: 500 },
] as const;

export const SIDEBAR_NAV = {
  RECEPTIONIST: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Patients", href: "/patients", icon: "Users" },
    { label: "Appointments", href: "/appointments", icon: "Calendar" },
    { label: "Billing", href: "/billing", icon: "Receipt" },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Patients", href: "/patients", icon: "Users" },
    { label: "Appointments", href: "/appointments", icon: "Calendar" },
    { label: "Consultations", href: "/consultations", icon: "Stethoscope" },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { label: "Patients", href: "/patients", icon: "Users" },
    { label: "Appointments", href: "/appointments", icon: "Calendar" },
    { label: "Billing", href: "/billing", icon: "Receipt" },
    { label: "Settings", href: "/settings", icon: "Settings" },
  ],
} as const;
