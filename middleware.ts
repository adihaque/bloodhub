import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (but allow access to login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminCookie = request.cookies.get('admin_auth')?.value
    if (!adminCookie || adminCookie !== '1') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}



