import { dbAll, dbFirst, dbRun, Env } from "./db";
import { epochMs, nowIso, readCookie } from "./utils";
// import { Request, Response } from "@cloudflare/workers-types";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  // base64url
  const b64 = btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return b64;
}

export type AuthedUser = { id: number; email: string; role: "user" | "admin" };

export async function ensureUserAndProfile(env: Env, email: string) {
  const existing = await dbFirst<{ id: number; email: string; role: string }>(
    env.DB,
    "SELECT id,email,role FROM users WHERE email=?",
    [email.toLowerCase()]
  );
  if (existing) return { userId: existing.id };

  // 首个用户 admin（替代 Supabase trigger handle_new_user）
  const countRow = await dbFirst<{ c: number }>(env.DB, "SELECT COUNT(*) as c FROM users", []);
  const isFirst = (countRow?.c ?? 0) === 0;
  const role = isFirst ? "admin" : "user";

  const now = nowIso();
  const res = await dbRun(
    env.DB,
    "INSERT INTO users(email, role, created_at, updated_at) VALUES(?,?,?,?)",
    [email.toLowerCase(), role, now, now]
  );

  const userId = Number(res.meta.last_row_id);

  await dbRun(
    env.DB,
    "INSERT INTO profiles(user_id,email,role,created_at,updated_at) VALUES(?,?,?,?,?)",
    [userId, email.toLowerCase(), role, now, now]
  );

  return { userId };
}

export async function createOtp(env: Env, email: string, language?: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  const ttlMin = Number(env.OTP_TTL_MINUTES || "10");
  const exp = epochMs() + ttlMin * 60_000;

  const codeHash = await sha256Hex(`${email.toLowerCase()}:${code}:${env.SESSION_PEPPER}`);
  await dbRun(
    env.DB,
    "INSERT INTO otp_codes(email, code_hash, language, expires_at, created_at) VALUES(?,?,?,?,?)",
    [email.toLowerCase(), codeHash, language ?? null, exp, epochMs()]
  );

  return { code, expiresAt: exp };
}

export async function verifyOtpAndCreateSession(env: Env, email: string, code: string) {
  const emailLc = email.toLowerCase();
  const codeHash = await sha256Hex(`${emailLc}:${code}:${env.SESSION_PEPPER}`);

  // 找到最新未过期的 OTP
  const rows = await dbAll<{ id: number; expires_at: number }>(
    env.DB,
    "SELECT id, expires_at FROM otp_codes WHERE email=? AND code_hash=? ORDER BY id DESC LIMIT 5",
    [emailLc, codeHash]
  );

  const now = epochMs();
  const hit = rows.find(r => r.expires_at > now);
  if (!hit) return { ok: false as const };

  // 用一次就删（更安全）
  await dbRun(env.DB, "DELETE FROM otp_codes WHERE id=?", [hit.id]);

  const { userId } = await ensureUserAndProfile(env, emailLc);

  // 建 session
  const sessionToken = randomToken(32);
  const tokenHash = await sha256Hex(`${sessionToken}:${env.SESSION_PEPPER}`);
  const ttlDays = Number(env.SESSION_TTL_DAYS || "30");
  const expiresAt = epochMs() + ttlDays * 24 * 60 * 60_000;

  await dbRun(
    env.DB,
    "INSERT INTO sessions(user_id, token_hash, expires_at, created_at) VALUES(?,?,?,?)",
    [userId, tokenHash, expiresAt, epochMs()]
  );

  const user = await dbFirst<{ id: number; email: string; role: string }>(
    env.DB,
    "SELECT id,email,role FROM users WHERE id=?",
    [userId]
  );

  return {
    ok: true as const,
    sessionToken,
    user: { id: user!.id, email: user!.email, role: user!.role as any }
  };
}

export async function getUserFromRequest(env: Env, req: Request): Promise<AuthedUser | null> {
  const token = readCookie(req, "session");
  if (!token) return null;
  const tokenHash = await sha256Hex(`${token}:${env.SESSION_PEPPER}`);

  const now = epochMs();
  const sess = await dbFirst<{ user_id: number; expires_at: number }>(
    env.DB,
    "SELECT user_id, expires_at FROM sessions WHERE token_hash=?",
    [tokenHash]
  );
  if (!sess) return null;
  if (sess.expires_at <= now) {
    await dbRun(env.DB, "DELETE FROM sessions WHERE token_hash=?", [tokenHash]);
    return null;
  }

  const user = await dbFirst<{ id: number; email: string; role: string }>(
    env.DB,
    "SELECT id,email,role FROM users WHERE id=?",
    [sess.user_id]
  );
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role as any };
}

export async function signOut(env: Env, req: Request) {
  const token = readCookie(req, "session");
  if (!token) return;
  const tokenHash = await sha256Hex(`${token}:${env.SESSION_PEPPER}`);
  await dbRun(env.DB, "DELETE FROM sessions WHERE token_hash=?", [tokenHash]);
}

export function sessionCookie(token: string) {
  // Secure 在本地 http 会失效；你可以在 dev 环境按需去掉
  return [
    `session=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${60 * 60 * 24 * 30}`,
  ].join("; ");
}
