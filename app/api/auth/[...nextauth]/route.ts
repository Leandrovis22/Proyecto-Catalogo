import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getDb } from '../../../../lib/db'

const options: any = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        // TODO: lookup user in D1 via drizzle and verify password
        const { email } = credentials || {}
        if (!email) return null
        // Return a user object
        return { id: 'user_1', name: 'Demo', email }
      }
    })
  ],
  session: { strategy: 'jwt' as const }
}

// NextAuth in App Router context is usually exported as default handler
export { options as authOptions }
export default NextAuth(options)
