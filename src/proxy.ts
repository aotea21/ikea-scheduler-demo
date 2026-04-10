import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];

// Routes only accessible to specific roles
const ROLE_ROUTES: Record<string, string[]> = {
    '/settings': ['ADMIN'],
    '/assemblers': ['ADMIN', 'DISPATCHER'],
    '/schedule': ['ADMIN', 'DISPATCHER'],
    '/orders': ['ADMIN', 'DISPATCHER'],
    '/map': ['ADMIN', 'DISPATCHER'],
};

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next({ request });

    // Always refresh session to keep it alive
    const supabase = createMiddlewareClient(request, response);
    const { data: { user } } = await supabase.auth.getUser();

    const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

    // Not logged in → redirect to login
    if (!user && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Already logged in, trying to access /login → redirect to home
    if (user && isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Role-based route protection
    if (user) {
        const requiredRoles = ROLE_ROUTES[pathname];
        if (requiredRoles) {
            // Fetch role from profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const role = profile?.role ?? '';
            if (!requiredRoles.includes(role)) {
                // Redirect to home (or a 403 page)
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        // Match all request paths except:
        // - _next/static (static files)
        // - _next/image (image optimization)
        // - favicon.ico
        // - public folder files
        // - manifest.json
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|api/.*|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)).*)',
    ],
};
