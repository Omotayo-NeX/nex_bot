import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateEnvironmentVariables } from "@/lib/env-validation";
import { NextRequest, NextResponse } from "next/server";

// Validate environment variables on startup
try {
  const validation = validateEnvironmentVariables();
  if (!validation.isValid) {
    console.error("🚨 NextAuth Environment Validation Failed:", validation.errors);
  }
} catch (error) {
  console.error("🚨 NextAuth Environment Validation Error:", error);
}

// Create NextAuth handler with error boundary
let handler: any;

try {
  handler = NextAuth(authOptions);
} catch (error) {
  console.error("🚨 NextAuth Configuration Error:", error);
  
  // Fallback handler for configuration errors
  handler = {
    GET: async (req: NextRequest) => {
      console.error("NextAuth GET request failed due to configuration error");
      return NextResponse.json(
        { 
          error: "Authentication service unavailable",
          message: "Server configuration error. Please contact support.",
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    },
    POST: async (req: NextRequest) => {
      console.error("NextAuth POST request failed due to configuration error");
      return NextResponse.json(
        { 
          error: "Authentication service unavailable",
          message: "Server configuration error. Please contact support.",
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }
  };
}

// Wrap handlers with additional error handling
async function GET(req: NextRequest) {
  try {
    return await handler.GET(req);
  } catch (error) {
    console.error("🚨 NextAuth GET Error:", error);
    return NextResponse.json(
      { 
        error: "Authentication error",
        message: "Unable to process authentication request. Please try again.",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

async function POST(req: NextRequest) {
  try {
    return await handler.POST(req);
  } catch (error) {
    console.error("🚨 NextAuth POST Error:", error);
    return NextResponse.json(
      { 
        error: "Authentication error",
        message: "Unable to process authentication request. Please try again.",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

export { GET, POST };