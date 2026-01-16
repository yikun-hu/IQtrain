// import { D1Database, Fetcher } from '@cloudflare/workers-types'
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;

  APP_ORIGIN: string;
  SESSION_TTL_DAYS: string;
  OTP_TTL_MINUTES: string;

  MAIL_FROM: string;
  MAILCHANNELS_API: string;

  PAYPAL_API_TYPE: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_SECRET: string;

  SESSION_PEPPER: string;
}

export async function dbFirst<T>(db: D1Database, sql: string, params: any[] = []) {
  const r = await db.prepare(sql).bind(...params).first<T>();
  return r ?? null;
}

export async function dbAll<T>(db: D1Database, sql: string, params: any[] = []) {
  const r = await db.prepare(sql).bind(...params).all<T>();
  return r.results ?? [];
}

export async function dbRun(db: D1Database, sql: string, params: any[] = []) {
  return await db.prepare(sql).bind(...params).run();
}
