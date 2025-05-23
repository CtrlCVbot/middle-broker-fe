import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/db';
import { users } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { compare } from 'bcrypt';
import { SystemAccessLevel } from '@/types/user';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user) {
          throw new Error('등록되지 않은 이메일입니다.');
        }

        //주석처리 풀지마시오!
        const isPasswordValid = await compare(credentials.password, user.password || '');

        if (!isPasswordValid) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        if (user.status !== 'active') {
          throw new Error('비활성화된 계정입니다.');
        }

        // 비밀번호 필드 제외하고 반환
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          system_access_level: user.system_access_level as SystemAccessLevel,
          domains: user.domains
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          system_access_level: token.system_access_level as SystemAccessLevel,
          domains: token.domains as string[]
        };
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}; 