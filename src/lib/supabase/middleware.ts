import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase environment variables are missing. Please check your .env.local file.");
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Middleware is responsible ONLY for:
    // 1) coarse access control (auth vs no-auth)
    // 2) preserving deep links via ?next=
    // It must NOT check memberships or perform other Supabase queries.
    const isAuthRoute =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/onboarding')
    const isPublicFile = request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)
    const isApi = request.nextUrl.pathname.startsWith('/api')
    const skipSessionCheck = isPublicFile || isApi || isAuthRoute

    if (skipSessionCheck) {
        return response
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        const loginUrl = new URL('/login', request.url)
        const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
        loginUrl.searchParams.set('next', nextPath)
        return NextResponse.redirect(loginUrl)
    }

    return response
}
