import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST /api/investigations/upload - Upload file
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const patientId = formData.get("patientId") as string;
    const appointmentId = formData.get("appointmentId") as string | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;

    if (!file || !patientId || !title) {
      return NextResponse.json(
        { error: "File, patientId, and title are required" },
        { status: 400 }
      );
    }

    // Determine file type
    const isImage = file.type.startsWith("image/");
    const fileType = isImage ? "IMAGE" : "PDF";

    // Save file to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const fileUrl = `/uploads/${fileName}`;

    const investigation = await prisma.investigation.create({
      data: {
        patientId,
        appointmentId: appointmentId || undefined,
        title,
        description: description || undefined,
        fileUrl,
        fileType,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json(investigation, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
