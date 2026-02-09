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

    // --- Performance Optimization: Skip Session Check List ---
    // These routes bypass the expensive sequential `getUser()` call in middleware 
    // to avoid waterfalls and enable faster TTFB/Streaming. 
    //
    // IMPORTANT Security Constraints for Skip List:
    // 1. MUST ONLY include read-only routes or user-scoped data routes.
    // 2. MUST NOT include admin routes, write/mutation routes, or shared data routes.
    // 3. These pages must handle unauthenticated states (e.g., redirecting in page logic).

    const isAuthPage = request.nextUrl.pathname.startsWith('/login')
    const isPublicFile = request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)
    const isApi = request.nextUrl.pathname.startsWith('/api')
    const isRoot = request.nextUrl.pathname === '/'
    const isStories = request.nextUrl.pathname.startsWith('/stories')
    const isSettings = request.nextUrl.pathname.startsWith('/settings')
    const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')
    const isLogin = request.nextUrl.pathname.startsWith('/login')

    const skipSessionCheck = isPublicFile || isApi || isRoot || isStories || isSettings || isLogin || isOnboarding

    if (skipSessionCheck) {
        return response
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isAuthPage) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}
