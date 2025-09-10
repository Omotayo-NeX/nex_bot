// Environment variables validation utility
export function validateEnvironmentVariables() {
  const requiredEnvVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };

  const missing: string[] = [];
  const invalid: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    } else if (value.trim() === '') {
      invalid.push(key);
    }
  }

  // Additional validation for specific env vars
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    invalid.push('NEXT_PUBLIC_SUPABASE_URL (must start with https://)');
  }

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    invalid.push('OPENAI_API_KEY (must start with sk-)');
  }

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    errors: [
      ...missing.map(key => `Missing required environment variable: ${key}`),
      ...invalid.map(key => `Invalid environment variable: ${key}`)
    ]
  };
}

export function logEnvValidation() {
  const validation = validateEnvironmentVariables();
  
  if (!validation.isValid) {
    console.error('🚨 Environment Variable Validation Failed:');
    validation.errors.forEach(error => console.error(`  ❌ ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
    }
  } else {
    console.log('✅ All required environment variables are present');
  }
  
  return validation;
}