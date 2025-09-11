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
    NEX_PROMPT_ID: process.env.NEX_PROMPT_ID,
  };

  // Optional but recommended environment variables (warn if missing)
  const optionalEnvVars = {
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    VERCEL_API_KEY: process.env.VERCEL_API_KEY,
  };

  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    } else if (value.trim() === '') {
      invalid.push(key);
    }
  }

  // Check optional environment variables (warnings only)
  for (const [key, value] of Object.entries(optionalEnvVars)) {
    if (!value) {
      warnings.push(`Optional environment variable missing: ${key} (some features may not work)`);
    }
  }

  // Additional validation for specific env vars
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    invalid.push('NEXT_PUBLIC_SUPABASE_URL (must start with https://)');
  }

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    invalid.push('OPENAI_API_KEY (must start with sk-)');
  }

  // Validate ElevenLabs API Key format
  if (process.env.ELEVENLABS_API_KEY && !process.env.ELEVENLABS_API_KEY.startsWith('sk_')) {
    invalid.push('ELEVENLABS_API_KEY (must start with sk_)');
  }

  // Validate Paystack keys
  if (process.env.PAYSTACK_SECRET_KEY && !process.env.PAYSTACK_SECRET_KEY.startsWith('sk_')) {
    invalid.push('PAYSTACK_SECRET_KEY (must start with sk_)');
  }

  if (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY && !process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.startsWith('pk_')) {
    invalid.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY (must start with pk_)');
  }

  // Validate NEX Prompt ID format
  if (process.env.NEX_PROMPT_ID && !process.env.NEX_PROMPT_ID.startsWith('pmpt_')) {
    invalid.push('NEX_PROMPT_ID (must start with pmpt_)');
  }

  // Validate Vercel API Key format (alphanumeric string)
  if (process.env.VERCEL_API_KEY && (process.env.VERCEL_API_KEY.length < 20 || !/^[a-zA-Z0-9]+$/.test(process.env.VERCEL_API_KEY))) {
    invalid.push('VERCEL_API_KEY (must be alphanumeric and at least 20 characters)');
  }

  return {
    isValid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    warnings,
    errors: [
      ...missing.map(key => `Missing required environment variable: ${key}`),
      ...invalid.map(key => `Invalid environment variable: ${key}`)
    ]
  };
}

export function logEnvValidation() {
  const validation = validateEnvironmentVariables();
  
  if (!validation.isValid) {
    console.error('🚨 CRITICAL: Environment Variable Validation Failed:');
    validation.errors.forEach(error => console.error(`  ❌ ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`🚨 SECURITY ISSUE: Environment validation failed: ${validation.errors.join(', ')}`);
    } else {
      console.error('🚨 Development mode: Fix these environment variables before deploying!');
    }
  } else {
    console.log('✅ All required environment variables are present and valid');
  }
  
  // Show warnings for optional variables
  if (validation.warnings && validation.warnings.length > 0) {
    console.warn('⚠️  Optional environment variables:');
    validation.warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
  }
  
  return validation;
}