import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes that don't need authentication
        if (pathname.startsWith('/auth') || pathname === '/') {
          return true
        }
        
        // Protected routes need authentication
        if (pathname.startsWith('/dashboard')) {
          if (!token) return false
          
          // Check role-based access
          if (pathname.startsWith('/dashboard/admin')) {
            return token?.role === 'ADMIN'
          }
          if (pathname.startsWith('/dashboard/patient')) {
            return token?.role === 'PATIENT'
          }
          if (pathname.startsWith('/dashboard/pharmacy')) {
            return token?.role === 'PHARMACY'
          }
          if (pathname.startsWith('/dashboard/delivery')) {
            return token?.role === 'DELIVERY_PARTNER'
          }
          if (pathname.startsWith('/dashboard/laboratory')) {
            return token?.role === 'LABORATORY'
          }
          if (pathname.startsWith('/dashboard/doctor')) {
            return token?.role === 'DOCTOR'
          }
          
          return !!token
        }
        
        // API routes
        if (pathname.startsWith('/api')) {
          // Public API routes that don't need authentication
          if (pathname === '/api/admin/seed') {
            return true
          }
          
          // Admin API routes
          if (pathname.startsWith('/api/admin')) {
            return token?.role === 'ADMIN'
          }
          
          // Most API routes need authentication
          return !!token
        }
        
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/api/:path*',
    '/((?!_next|static|favicon.ico).*)'
  ]
}