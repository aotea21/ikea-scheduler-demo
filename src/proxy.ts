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

    // Use getSession() — reads JWT from cookie locally (no network call).
    // This is much faster than getUser() which hits the Supabase Auth server.
    const supabase = createMiddlewareClient(request, response);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;

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
    // Read role from JWT user_metadata (set during auth.admin.createUser)
    // to avoid a DB round-trip on every request.
    if (user) {
        const requiredRoles = ROLE_ROUTES[pathname];
        if (requiredRoles) {
            const role = (user.user_metadata?.role as string) ?? '';
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
        // - api routes (have their own auth)
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|api/.*|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)).*)',
    ],
};
