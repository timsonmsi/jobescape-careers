import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";

export async function saveUploadedFile(
  file: File,
  subDir: string = "resumes"
): Promise<{ path: string; url: string }> {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const fullPath = join(uploadDir, subDir);

  // Create directory if it doesn't exist
  if (!existsSync(fullPath)) {
    await mkdir(fullPath, { recursive: true });
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = join(fullPath, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return {
    path: filePath,
    url: `/uploads/${subDir}/${fileName}`,
  };
}

export async function extractTextFromPDF(file: File): Promise<string> {
  // For now, return a placeholder
  // In production, use pdf-parse or similar library
  return `PDF Resume: ${file.name}`;
}

export async function extractTextFromDocx(file: File): Promise<string> {
  // For now, return a placeholder
  // In production, use mammoth or similar library
  return `DOCX Resume: ${file.name}`;
}

export function getFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "docx";
  if (ext === "txt") return "txt";
  return "unknown";
}
