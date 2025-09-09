import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";

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
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return `${baseUrl}/chat`
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        
        // Check if user's email is verified
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true, email: true }
        });
        
        token.emailVerified = dbUser?.emailVerified;
        token.email = dbUser?.email || user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        
        // For unverified users, return a minimal session that can be checked on client
        if (!token.emailVerified) {
          // Keep minimal session data for verification flow
          session.user.emailVerified = null;
        }
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "credentials") {
        // Check if user's email is verified for credentials login
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { emailVerified: true }
        });
        
        if (!dbUser?.emailVerified) {
          // Prevent sign in if email is not verified
          return '/verify-email?error=email_not_verified';
        }
      }
      return true;
    },
  },
};