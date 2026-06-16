import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.vital.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  console.log("  Cleaned existing data");

  // Create Users
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const doctorPassword = await bcrypt.hash("doctor123", 10);
  const receptionPassword = await bcrypt.hash("reception123", 10);

  const admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@patkar.clinic", password: hashedPassword, role: "ADMIN" },
  });

  const doctor = await prisma.user.create({
    data: { name: "Dr. Vikrant Patkar", email: "doctor@patkar.clinic", password: doctorPassword, role: "DOCTOR" },
  });

  const receptionist = await prisma.user.create({
    data: { name: "Priya Sharma", email: "receptionist@patkar.clinic", password: receptionPassword, role: "RECEPTIONIST" },
  });

  console.log("  ✓ Created users (admin, doctor, receptionist)");

  // Create Patients
  const patients = await Promise.all([
    prisma.patient.create({ data: { uhid: "UHID-20260601-0001", name: "Rajesh Kumar", age: 45, gender: "MALE", phone: "9876543210", address: "Palghar, Maharashtra", bloodGroup: "B+", allergies: "Penicillin" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260601-0002", name: "Sunita Devi", age: 35, gender: "FEMALE", phone: "9876543211", address: "Boisar, Palghar", bloodGroup: "O+", allergies: "" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260602-0003", name: "Amit Patel", age: 28, gender: "MALE", phone: "9876543212", address: "Vasai, Maharashtra", bloodGroup: "A+" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260603-0004", name: "Meera Joshi", age: 52, gender: "FEMALE", phone: "9876543213", address: "Palghar, Maharashtra", bloodGroup: "AB+", allergies: "Sulfa drugs", emergencyContact: "Ramesh Joshi", emergencyPhone: "9876543299" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260604-0005", name: "Vikram Singh", age: 60, gender: "MALE", phone: "9876543214", address: "Kelwa, Palghar", bloodGroup: "O-" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260605-0006", name: "Priya Mehta", age: 22, gender: "FEMALE", phone: "9876543215", address: "Palghar, Maharashtra", bloodGroup: "B+" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260606-0007", name: "Suresh Rao", age: 48, gender: "MALE", phone: "9876543216", address: "Safala, Palghar" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260607-0008", name: "Anita Gupta", age: 38, gender: "FEMALE", phone: "9876543217", address: "Palghar, Maharashtra", bloodGroup: "A-" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260608-0009", name: "Manoj Tiwari", age: 55, gender: "MALE", phone: "9876543218", address: "Virar, Maharashtra" } }),
    prisma.patient.create({ data: { uhid: "UHID-20260609-0010", name: "Kavita Deshmukh", age: 42, gender: "FEMALE", phone: "9876543219", address: "Palghar, Maharashtra", bloodGroup: "AB-" } }),
  ]);

  console.log("  ✓ Created 10 sample patients");

  // Create some appointments for today
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const apt1 = await prisma.appointment.create({
    data: { patientId: patients[0].id, createdById: receptionist.id, date: today, timeSlot: "09:00 AM", status: "COMPLETED" },
  });

  const apt2 = await prisma.appointment.create({
    data: { patientId: patients[1].id, createdById: receptionist.id, date: today, timeSlot: "09:30 AM", status: "COMPLETED" },
  });

  const apt3 = await prisma.appointment.create({
    data: { patientId: patients[2].id, createdById: receptionist.id, date: today, timeSlot: "10:00 AM", status: "ARRIVED" },
  });

  const apt4 = await prisma.appointment.create({
    data: { patientId: patients[3].id, createdById: receptionist.id, date: today, timeSlot: "10:30 AM", status: "SCHEDULED" },
  });

  const apt5 = await prisma.appointment.create({
    data: { patientId: patients[4].id, createdById: receptionist.id, date: today, timeSlot: "11:00 AM", status: "SCHEDULED" },
  });

  console.log("  ✓ Created 5 appointments for today");

  // Add vitals for first two completed appointments
  await prisma.vital.create({
    data: { patientId: patients[0].id, appointmentId: apt1.id, weight: 72, height: 170, bloodPressure: "130/85", pulse: 78, temperature: 98.6, spo2: 97, recordedById: receptionist.id },
  });

  await prisma.vital.create({
    data: { patientId: patients[1].id, appointmentId: apt2.id, weight: 58, height: 160, bloodPressure: "120/80", pulse: 72, temperature: 99.0, spo2: 98, randomBloodSugar: 110, recordedById: receptionist.id },
  });

  console.log("  ✓ Created vitals");

  // Add consultations
  const consult1 = await prisma.consultation.create({
    data: { patientId: patients[0].id, appointmentId: apt1.id, chiefComplaint: "Persistent cough for 5 days", symptoms: "Dry cough, mild fever, body ache", clinicalFindings: "Throat congestion, mild wheezing", diagnosis: "Upper Respiratory Tract Infection", advice: "Rest, warm fluids, steam inhalation", followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), doctorId: doctor.id },
  });

  const consult2 = await prisma.consultation.create({
    data: { patientId: patients[1].id, appointmentId: apt2.id, chiefComplaint: "Headache and dizziness", symptoms: "Frontal headache, nausea, fatigue", clinicalFindings: "BP slightly elevated", diagnosis: "Tension Headache", advice: "Adequate sleep, stress management, avoid screen time", followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), doctorId: doctor.id },
  });

  console.log("  ✓ Created consultations");

  // Add prescriptions
  await prisma.prescription.create({
    data: {
      patientId: patients[0].id, consultationId: consult1.id, doctorId: doctor.id,
      items: {
        create: [
          { medicineName: "Tab. Azithromycin 500mg", dosage: "500mg", frequency: "Once daily", duration: "3 days", instructions: "After food", sortOrder: 0 },
          { medicineName: "Tab. Paracetamol 650mg", dosage: "650mg", frequency: "Three times daily", duration: "5 days", instructions: "After food, if fever", sortOrder: 1 },
          { medicineName: "Syr. Benadryl Cough", dosage: "10ml", frequency: "Three times daily", duration: "5 days", instructions: "After food", sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.prescription.create({
    data: {
      patientId: patients[1].id, consultationId: consult2.id, doctorId: doctor.id,
      items: {
        create: [
          { medicineName: "Tab. Paracetamol 500mg", dosage: "500mg", frequency: "As needed (SOS)", duration: "5 days", instructions: "Max 3 per day", sortOrder: 0 },
          { medicineName: "Tab. Domperidone 10mg", dosage: "10mg", frequency: "Three times daily", duration: "3 days", instructions: "Before food", sortOrder: 1 },
        ],
      },
    },
  });

  console.log("  ✓ Created prescriptions");

  // Add bills for completed appointments
  await prisma.bill.create({
    data: {
      patientId: patients[0].id, appointmentId: apt1.id, totalAmount: 500, paymentStatus: "PAID", paymentMethod: "CASH", createdById: receptionist.id,
      items: { create: [{ description: "Consultation Fee", amount: 500, quantity: 1, sortOrder: 0 }] },
    },
  });

  await prisma.bill.create({
    data: {
      patientId: patients[1].id, appointmentId: apt2.id, totalAmount: 700, paymentStatus: "PAID", paymentMethod: "UPI", createdById: receptionist.id,
      items: {
        create: [
          { description: "Consultation Fee", amount: 500, quantity: 1, sortOrder: 0 },
          { description: "Injection Charges", amount: 200, quantity: 1, sortOrder: 1 },
        ],
      },
    },
  });

  console.log("  ✓ Created bills");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("  Admin:        admin@patkar.clinic / admin123");
  console.log("  Doctor:       doctor@patkar.clinic / doctor123");
  console.log("  Receptionist: receptionist@patkar.clinic / reception123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
