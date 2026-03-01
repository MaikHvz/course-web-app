import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

    // Fetch Session User
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Custom Validation Logic
    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Check custom role table
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        if (error || !profile || profile.role !== 'admin') {
            console.error('Admin check failed:', error || 'No profile found');
            return NextResponse.redirect(new URL('/', request.url)) // Forbidden
        }
    }

    // Protect Dashboard Routes (Student)
    const dashboardRoutes = ['/mis-cursos', '/logros', '/perfil']
    const isDashboardRoute = dashboardRoutes.some(route => pathname.startsWith(route))

    if (isDashboardRoute) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return supabaseResponse
}
