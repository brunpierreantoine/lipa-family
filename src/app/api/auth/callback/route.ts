import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && session?.user) {
            // Check allow-list
            const { data: authorized } = await supabase
                .from('pre_authorized_emails')
                .select('email')
                .eq('email', session.user.email)
                .single();

            if (!authorized) {
                await supabase.auth.signOut();
                return NextResponse.redirect(`${canonicalOrigin}/login?error=not_authorized`)
            }

            return NextResponse.redirect(`${canonicalOrigin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${canonicalOrigin}/login?error=auth_failed`)
}
