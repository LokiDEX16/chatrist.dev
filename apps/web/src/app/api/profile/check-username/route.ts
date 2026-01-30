import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { UsernameSchema, formatZodErrors } from '@/lib/validations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { available: false, reason: 'Username is required' },
      { status: 400 }
    );
  }

  const parsed = UsernameSchema.safeParse(username);
  if (!parsed.success) {
    const errors = formatZodErrors(parsed.error);
    const reason = Object.values(errors).flat()[0] || 'Invalid username format';
    return NextResponse.json({ available: false, reason });
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('public_profiles')
    .select('id')
    .eq('username', parsed.data)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { available: false, reason: 'Failed to check availability' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    available: data === null,
    reason: data ? 'Username is already taken' : undefined,
  });
}
