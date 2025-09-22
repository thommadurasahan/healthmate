import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            patient: true,
            pharmacy: true,
            deliveryPartner: true,
            laboratory: true,
            doctor: true,
            admin: true
          }
        })

        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isApproved: user.isApproved,
          patient: user.patient,
          pharmacy: user.pharmacy,
          deliveryPartner: user.deliveryPartner,
          laboratory: user.laboratory,
          doctor: user.doctor,
          admin: user.admin
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.isApproved = user.isApproved
        token.patient = user.patient
        token.pharmacy = user.pharmacy
        token.deliveryPartner = user.deliveryPartner
        token.laboratory = user.laboratory
        token.doctor = user.doctor
        token.admin = user.admin
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isApproved = token.isApproved as boolean
        session.user.patient = token.patient as any
        session.user.pharmacy = token.pharmacy as any
        session.user.deliveryPartner = token.deliveryPartner as any
        session.user.laboratory = token.laboratory as any
        session.user.doctor = token.doctor as any
        session.user.admin = token.admin as any
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  session: {
    strategy: 'jwt'
  }
}