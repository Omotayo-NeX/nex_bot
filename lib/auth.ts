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
      // Handle verification redirects specifically
      if (url.includes('verify-email') || url.includes('email_not_verified')) {
        return `${baseUrl}/verify-email`
      }
      
      // If it's a relative URL starting with /, prepend baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // If it's already an absolute URL within our domain, return it
      if (url.startsWith(baseUrl)) return url
      
      // Default redirect after successful login
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
        
        // Fetch complete user data including plan for complete session
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { 
              plan: true,
              chat_used_today: true,
              videos_generated_this_week: true,
              voice_minutes_this_week: true,
              plan_expires_at: true,
              emailVerified: true
            }
          });
          
          if (dbUser) {
            session.user.plan = dbUser.plan || 'free';
            session.user.chat_used_today = dbUser.chat_used_today || 0;
            session.user.videos_generated_this_week = dbUser.videos_generated_this_week || 0;
            session.user.voice_minutes_this_week = dbUser.voice_minutes_this_week || 0;
            session.user.plan_expires_at = dbUser.plan_expires_at;
            session.user.emailVerified = dbUser.emailVerified;
          } else {
            // Fallback defaults to prevent blank pages
            session.user.plan = 'free';
            session.user.chat_used_today = 0;
            session.user.videos_generated_this_week = 0;
            session.user.voice_minutes_this_week = 0;
            session.user.plan_expires_at = null;
          }
        } catch (error) {
          console.error('Session callback error:', error);
          // Fallback defaults to prevent blank pages
          session.user.plan = 'free';
          session.user.chat_used_today = 0;
          session.user.videos_generated_this_week = 0;
          session.user.voice_minutes_this_week = 0;
          session.user.plan_expires_at = null;
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