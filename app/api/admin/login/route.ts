import { NextResponse } from 'next/server'

// Use environment variable for admin secret
const ADMIN_SECRET = process.env.ADMIN_SECRET

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    if (!secret || !ADMIN_SECRET || secret !== ADMIN_SECRET) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    // Set httpOnly cookie for middleware to check
    res.cookies.set('admin_auth', '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
    })
    return res
  } catch (e) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }
}





