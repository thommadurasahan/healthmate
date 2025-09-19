import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      patient?: any
      pharmacy?: any
      admin?: any
    }
  }

  interface User {
    role: string
    patient?: any
    pharmacy?: any
    admin?: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    patient?: any
    pharmacy?: any
    admin?: any
  }
}