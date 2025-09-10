import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
// import { validateEnvironmentVariables } from "./env-validation";

// Validate environment variables before creating auth options
// const envValidation = validateEnvironmentVariables();
// if (!envValidation.isValid) {
//   console.error('🚨 Auth Configuration - Environment validation failed:', envValidation.errors);
// }

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          image: user.image 
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    newUser: "/chat",
    signOut: "/",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.includes('verify-email') || url.includes('email_not_verified')) {
        return `${baseUrl}/verify-email`
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/chat`
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
        session.user.name = token.name as string || session.user.name;
        session.user.email = token.email as string || session.user.email;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { emailVerified: true }
        });
        
        if (!dbUser?.emailVerified) {
          return '/verify-email?error=email_not_verified';
        }
      }
      return true;
    },
  },
};