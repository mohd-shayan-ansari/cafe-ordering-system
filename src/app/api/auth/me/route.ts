import { NextResponse } from 'next/server';
import { getCurrentUser, getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const session = await getSession();
    console.log('[Auth/Me] Session:', session ? `userId: ${session.userId}, role: ${session.role}` : 'null');
    
    const user = await getCurrentUser();
    if (!user) {
      console.log('[Auth/Me] No user found - session may be invalid');
      return NextResponse.json({ user: null });
    }
    
    console.log('[Auth/Me] User found:', { name: user.name, role: user.role });
    return NextResponse.json({ user });
  } catch (e: any) {
    console.error('[Auth/Me] Error:', e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
