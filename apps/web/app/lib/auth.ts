import { type NextAuthOptions, getServerSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = (user as any).role || token.role
        token.verified = (user as any).verified ?? token.verified
      }
      return token as any
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = (token as any).role
        ;(session.user as any).verified = (token as any).verified
      }
      return session
    },
  },
  pages: { signIn: '/login' }
}

export async function getSession() {
  return getServerSession(authOptions)
}