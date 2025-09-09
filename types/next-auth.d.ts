import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
  }
  
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      emailVerified?: Date | null
      plan?: string
      chat_used_today?: number
      videos_generated_this_week?: number
      voice_minutes_this_week?: number
      plan_expires_at?: Date | null
    }
  }
  
  interface JWT {
    emailVerified?: Date | null
  }
}