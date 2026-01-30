import { NextResponse } from 'next/server';

/**
 * Auth is handled by Supabase directly.
 * This route exists only as a placeholder to prevent 404s
 * if any legacy code references /api/auth/*.
 */
export async function GET() {
  return NextResponse.json({ message: 'Auth is handled by Supabase. Use /login or /register.' }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ message: 'Auth is handled by Supabase. Use /login or /register.' }, { status: 200 });
}
