import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dr_sec_8f9a2e4b1c7d6e5f3a2b1c0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0";
const COOKIE_NAME = "dr_admin_session";

export interface AdminPayload {
  userId: string;
  username: string;
  role: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    const payload = verifyAdminToken(token);
    if (payload && payload.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, username: true, name: true, role: true },
        });
        if (user) return user;
      } catch (err) {
        console.warn("DB user query error in getCurrentAdmin:", err);
      }

      // Jika role ADMIN dan token sah, berikan akses agar admin tidak terputus saat latency DB
      if (payload.role === "ADMIN") {
        return {
          id: payload.userId,
          username: payload.username || "admin",
          name: "Admin Dapur Rasa",
          role: "ADMIN",
        };
      }
    }
  }

  // Keamanan otentikasi ketat: jika token sesi tidak ditemukan atau tidak valid, akses ditolak
  return null;
}

export { COOKIE_NAME };
