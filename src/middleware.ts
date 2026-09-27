import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 1. Proteksi Tenant Dashboard (Menggunakan Session Cookie Kustom)
  if (pathname.startsWith('/tenant/dashboard')) {
    const sessionCookie = request.cookies.get('tenant_session')
    
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Proteksi Admin Dashboard (Menggunakan Supabase Auth)
  if (pathname.startsWith('/dashboard')) {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Jika tidak ada user yang terautentikasi, arahkan ke halaman login admin
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
  }

  return NextResponse.next()
}

// Daftarkan rute admin (/dashboard) dan tenant (/tenant/dashboard) ke middleware
export const config = {
  matcher: ['/tenant/dashboard/:path*', '/dashboard/:path*'],
}
