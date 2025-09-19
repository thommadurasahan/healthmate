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
          return !!token
        }
        
        // Admin routes
        if (pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        // Pharmacy routes
        if (pathname.startsWith('/pharmacy')) {
          return token?.role === 'PHARMACY'
        }
        
        // Patient routes
        if (pathname.startsWith('/patient')) {
          return token?.role === 'PATIENT'
        }
        
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/pharmacy/:path*', '/patient/:path*']
}