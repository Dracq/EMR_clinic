"""
Seed script — creates initial admin user, default settings, and sample medicines.

Usage:
    cd backend
    python -m scripts.seed
"""
import sys
import os

# Add parent dir to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models import User, Setting, Medicine, PrescriptionTemplate, PrescriptionTemplateItem, InvestigationTemplate, InvestigationTemplateItem
from app.utils.security import hash_password


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")

    db = SessionLocal()

    try:
        # ── Users ────────────────────────────────────────
        existing_admin = db.query(User).filter(User.email == "admin@patkar.clinic").first()
        if not existing_admin:
            users = [
                User(name="Admin", email="admin@patkar.clinic", password_hash=hash_password("admin123"), role="ADMIN"),
                User(name="Dr. Vikrant Patkar", email="doctor@patkar.clinic", password_hash=hash_password("doctor123"), role="DOCTOR"),
                User(name="Priya Sharma", email="receptionist@patkar.clinic", password_hash=hash_password("reception123"), role="RECEPTIONIST"),
            ]
            db.add_all(users)
            db.commit()
            print("✅ Users created")
            print("   Admin:        admin@patkar.clinic / admin123")
            print("   Doctor:       doctor@patkar.clinic / doctor123")
            print("   Receptionist: receptionist@patkar.clinic / reception123")
        else:
            print("ℹ️  Users already exist, skipping")

        # ── Settings ─────────────────────────────────────
        default_settings = {
            "clinic_name": "Patkar Clinic",
            "doctor_name": "Dr. Vikrant Patkar",
            "doctor_qualifications": "",
            "clinic_address": "Palghar, Maharashtra",
            "clinic_phone": "",
            "clinic_email": "",
            "clinic_registration_no": "",
            "consultation_fee": "500",
            "followup_fee": "300",
            "clinic_timing": "09:00-13:00, 17:00-21:00",
            "logo_url": "",
            "signature_url": "",
            "prescription_header": "",
            "prescription_footer": "",
        }

        for key, value in default_settings.items():
            existing = db.query(Setting).filter(Setting.key == key).first()
            if not existing:
                db.add(Setting(key=key, value=value))

        db.commit()
        print("✅ Default settings created")

        # ── Medicines ────────────────────────────────────
        medicines_data = [
            # Analgesics / Antipyretics
            ("Dolo", "650mg", "1 tablet", "Three times daily", "3 days", "Analgesic"),
            ("Paracetamol", "500mg", "1 tablet", "Three times daily", "5 days", "Analgesic"),
            ("Ibuprofen", "400mg", "1 tablet", "Three times daily", "3 days", "NSAID"),
            ("Diclofenac", "50mg", "1 tablet", "Twice daily", "5 days", "NSAID"),
            ("Aceclofenac", "100mg", "1 tablet", "Twice daily", "5 days", "NSAID"),

            # Antibiotics
            ("Azithromycin", "500mg", "1 tablet", "Once daily", "3 days", "Antibiotic"),
            ("Amoxicillin", "500mg", "1 capsule", "Three times daily", "5 days", "Antibiotic"),
            ("Cefixime", "200mg", "1 tablet", "Twice daily", "5 days", "Antibiotic"),
            ("Ciprofloxacin", "500mg", "1 tablet", "Twice daily", "5 days", "Antibiotic"),
            ("Doxycycline", "100mg", "1 capsule", "Twice daily", "5 days", "Antibiotic"),
            ("Metronidazole", "400mg", "1 tablet", "Three times daily", "5 days", "Antibiotic"),
            ("Levofloxacin", "500mg", "1 tablet", "Once daily", "5 days", "Antibiotic"),

            # GI
            ("Pantoprazole", "40mg", "1 tablet", "Once daily (before breakfast)", "14 days", "Antacid"),
            ("Omeprazole", "20mg", "1 capsule", "Once daily (before breakfast)", "14 days", "Antacid"),
            ("Ranitidine", "150mg", "1 tablet", "Twice daily", "7 days", "Antacid"),
            ("Domperidone", "10mg", "1 tablet", "Three times daily (before food)", "5 days", "Antiemetic"),
            ("Ondansetron", "4mg", "1 tablet", "As needed (SOS)", "3 days", "Antiemetic"),
            ("ORS", "1 sachet", "1 sachet in 1L water", "Sip frequently", "3 days", "Rehydration"),
            ("Racecadotril", "100mg", "1 capsule", "Three times daily", "3 days", "Antidiarrheal"),

            # Antihistamines
            ("Cetirizine", "10mg", "1 tablet", "Once daily (at night)", "5 days", "Antihistamine"),
            ("Levocetirizine", "5mg", "1 tablet", "Once daily (at night)", "5 days", "Antihistamine"),
            ("Montelukast", "10mg", "1 tablet", "Once daily (at night)", "14 days", "Antiasthmatic"),

            # Cough
            ("Benadryl Cough Syrup", "10ml", "10ml", "Three times daily", "5 days", "Cough Syrup"),
            ("Ambroxol", "30mg", "1 tablet", "Three times daily", "5 days", "Mucolytic"),
            ("Dextromethorphan Syrup", "10ml", "10ml", "Three times daily", "5 days", "Antitussive"),

            # Diabetes
            ("Metformin", "500mg", "1 tablet", "Twice daily (after food)", "30 days", "Antidiabetic"),
            ("Glimepiride", "1mg", "1 tablet", "Once daily (before breakfast)", "30 days", "Antidiabetic"),

            # Cardiac / BP
            ("Amlodipine", "5mg", "1 tablet", "Once daily", "30 days", "Antihypertensive"),
            ("Telmisartan", "40mg", "1 tablet", "Once daily", "30 days", "Antihypertensive"),
            ("Atenolol", "50mg", "1 tablet", "Once daily", "30 days", "Beta Blocker"),
            ("Aspirin", "75mg", "1 tablet", "Once daily (after food)", "30 days", "Antiplatelet"),
            ("Atorvastatin", "10mg", "1 tablet", "Once daily (at night)", "30 days", "Statin"),
            ("Rosuvastatin", "10mg", "1 tablet", "Once daily (at night)", "30 days", "Statin"),

            # Supplements
            ("Calcium + Vitamin D3", "500mg", "1 tablet", "Once daily", "30 days", "Supplement"),
            ("Iron + Folic Acid", "100mg", "1 tablet", "Once daily (after food)", "30 days", "Supplement"),
            ("Multivitamin", "1 tablet", "1 tablet", "Once daily", "30 days", "Supplement"),
            ("Vitamin B Complex", "1 tablet", "1 tablet", "Once daily", "30 days", "Supplement"),
            ("Zinc", "50mg", "1 tablet", "Once daily", "14 days", "Supplement"),

            # Steroids
            ("Prednisolone", "10mg", "1 tablet", "Once daily (after breakfast)", "5 days", "Steroid"),
            ("Dexamethasone", "4mg", "1 tablet", "Once daily", "3 days", "Steroid"),

            # Topical
            ("Mupirocin Ointment", "2%", "Apply locally", "Three times daily", "7 days", "Topical"),
            ("Betamethasone Cream", "0.05%", "Apply locally", "Twice daily", "7 days", "Topical"),
            ("Clotrimazole Cream", "1%", "Apply locally", "Twice daily", "14 days", "Antifungal"),

            # Others
            ("Tramadol", "50mg", "1 tablet", "As needed (SOS)", "3 days", "Opioid Analgesic"),
            ("Chlorpheniramine", "4mg", "1 tablet", "Three times daily", "3 days", "Antihistamine"),
        ]

        existing_count = db.query(Medicine).count()
        if existing_count == 0:
            for name, strength, dosage, freq, dur, cat in medicines_data:
                db.add(Medicine(
                    name=name,
                    strength=strength,
                    default_dosage=dosage,
                    default_frequency=freq,
                    default_duration=dur,
                    category=cat,
                ))
            db.commit()
            print(f"✅ {len(medicines_data)} medicines created")
        else:
            print(f"ℹ️  Medicines already exist ({existing_count}), skipping")

        # ── Prescription Templates ───────────────────────
        templates_data = [
            ("Viral Fever", "Common viral fever protocol", [
                ("Dolo", "650mg", "1 tablet", "Three times daily", "3 days", "After food, if fever"),
                ("Pantoprazole", "40mg", "1 tablet", "Once daily", "5 days", "Before breakfast"),
                ("ORS", "1 sachet", "Dissolve in 1L water", "Sip frequently", "3 days", "Stay hydrated"),
            ]),
            ("URTI", "Upper respiratory tract infection", [
                ("Azithromycin", "500mg", "1 tablet", "Once daily", "3 days", "After food"),
                ("Dolo", "650mg", "1 tablet", "Three times daily", "3 days", "After food, if fever"),
                ("Benadryl Cough Syrup", "10ml", "10ml", "Three times daily", "5 days", "After food"),
                ("Cetirizine", "10mg", "1 tablet", "Once daily", "5 days", "At night"),
            ]),
            ("Gastritis / Acidity", "Acid reflux management", [
                ("Pantoprazole", "40mg", "1 tablet", "Once daily", "14 days", "Before breakfast"),
                ("Domperidone", "10mg", "1 tablet", "Three times daily", "5 days", "Before food"),
            ]),
            ("UTI", "Urinary tract infection", [
                ("Ciprofloxacin", "500mg", "1 tablet", "Twice daily", "5 days", "After food"),
                ("Paracetamol", "500mg", "1 tablet", "Three times daily", "3 days", "After food, if pain"),
            ]),
            ("Hypertension Start", "Initial hypertension management", [
                ("Amlodipine", "5mg", "1 tablet", "Once daily", "30 days", "Morning"),
                ("Telmisartan", "40mg", "1 tablet", "Once daily", "30 days", "Morning"),
            ]),
        ]

        existing_templates = db.query(PrescriptionTemplate).count()
        if existing_templates == 0:
            for name, desc, items in templates_data:
                template = PrescriptionTemplate(name=name, description=desc)
                db.add(template)
                db.flush()
                for i, (med_name, strength, dosage, freq, dur, instr) in enumerate(items):
                    db.add(PrescriptionTemplateItem(
                        template_id=template.id,
                        medicine_name=med_name,
                        strength=strength,
                        dosage=dosage,
                        frequency=freq,
                        duration=dur,
                        instructions=instr,
                        sort_order=i,
                    ))
            db.commit()
            print(f"✅ {len(templates_data)} prescription templates created")
        else:
            print("ℹ️  Prescription templates already exist, skipping")

        # ── Investigation Templates ──────────────────────
        inv_templates_data = [
            ("Diabetes Package", "Routine diabetes screening", ["HbA1c", "Fasting Blood Sugar", "Post Prandial Blood Sugar", "Serum Creatinine", "Urine Routine"]),
            ("Thyroid Panel", "Complete thyroid assessment", ["TSH", "Free T3", "Free T4"]),
            ("Complete Blood Count", "Full CBC", ["CBC with ESR"]),
            ("Liver Function", "Liver assessment", ["Total Bilirubin", "Direct Bilirubin", "SGOT", "SGPT", "Alkaline Phosphatase", "Total Protein", "Albumin"]),
            ("Kidney Function", "Renal assessment", ["Blood Urea", "Serum Creatinine", "Uric Acid", "Sodium", "Potassium"]),
            ("Lipid Profile", "Cardiac risk assessment", ["Total Cholesterol", "HDL Cholesterol", "LDL Cholesterol", "Triglycerides", "VLDL"]),
            ("Pre-Op Workup", "Pre-operative basic investigations", ["CBC with ESR", "Blood Sugar Random", "Blood Urea", "Serum Creatinine", "PT/INR", "Blood Group", "HIV", "HBsAg", "ECG", "Chest X-Ray"]),
        ]

        existing_inv_templates = db.query(InvestigationTemplate).count()
        if existing_inv_templates == 0:
            for name, desc, tests in inv_templates_data:
                template = InvestigationTemplate(name=name, description=desc)
                db.add(template)
                db.flush()
                for i, test_name in enumerate(tests):
                    db.add(InvestigationTemplateItem(
                        template_id=template.id,
                        test_name=test_name,
                        sort_order=i,
                    ))
            db.commit()
            print(f"✅ {len(inv_templates_data)} investigation templates created")
        else:
            print("ℹ️  Investigation templates already exist, skipping")

        print("\n🎉 Database seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
