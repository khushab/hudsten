import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@hudsten/db";
import { newsletterSchema } from "@hudsten/shared";
import { createPublicClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Best-effort in-memory rate limit (PRD §9). Per-instance only — fine for Phase 1.
 * PHASE 2: move to a durable store (Upstash/Redis) for multi-instance correctness.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/**
 * Same-origin check: browsers send Origin on cross-site POSTs, so a foreign
 * origin means CSRF/abuse. Absent header (curl, some old clients) is allowed —
 * the goal is blocking hostile browser-based submissions, not all scripting.
 */
function originAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, ""),
    "http://localhost:3000",
  ].filter(Boolean);
  return allowed.includes(origin.replace(/\/$/, ""));
}

export async function POST(req: Request) {
  if (!originAllowed(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  // Honeypot tripped → pretend success, store nothing.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ status: "subscribed" });
  }

  try {
    const result = await subscribeToNewsletter(
      createPublicClient(),
      parsed.data.email,
      parsed.data.source,
    );
    return NextResponse.json({ status: result });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
