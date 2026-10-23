import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dapur-rasa-dev-super-secret-key-replace-in-prod-2026";
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
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, name: true, role: true },
      });
      if (user) return user;
    }
  }

  // Fallback dev mode: prevent empty/broken tables in development
  if (process.env.NODE_ENV !== "production") {
    const devAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, username: true, name: true, role: true },
    });
    if (devAdmin) return devAdmin;
  }

  return null;
}

export { COOKIE_NAME };
