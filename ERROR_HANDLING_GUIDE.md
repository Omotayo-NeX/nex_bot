# Chat API Error Handling & Logging Guide

## Overview
This document outlines the comprehensive error handling and logging system implemented for the `/api/chat` route.

## Implementation Summary

### ✅ Completed Improvements

1. **Environment Variable Validation** - All required env vars are checked at startup
2. **Comprehensive Error Logging** - Detailed logs with request IDs for tracing
3. **OpenAI API Error Handling** - Specific handling for quotas, rate limits, auth errors
4. **Supabase Error Handling** - Graceful fallbacks for database issues
5. **Frontend Error Surfacing** - Real error messages displayed to users
6. **Debug Logging** - Development mode includes detailed request/response logs

## Error Types & Expected Logs

### 1. **Missing Environment Variables**
```
❌ [Chat API] req_1234567890_abc123 ENV ERROR: Missing environment variables: OPENAI_API_KEY
```

**Frontend Response:**
```json
{
  "error": "Server configuration error",
  "response": "The server is not properly configured. Please contact support.",
  "requestId": "req_1234567890_abc123"
}
```

### 2. **Authentication Errors**
```
🚫 [Chat API] req_1234567890_abc123 Authentication failed - no token or user ID
```

**Frontend Response:**
```json
{
  "error": "Authentication required",
  "response": "Please sign in to use the chat feature.",
  "requestId": "req_1234567890_abc123"
}
```

### 3. **Usage Limit Reached**
```
🚫 [Chat API] req_1234567890_abc123 Feature access denied for user user123: Daily chat limit reached (20/20)
```

**Frontend Response:**
```json
{
  "error": "Daily chat limit reached (20/20)",
  "response": "You have reached your chat limit. Daily chat limit reached (20/20)",
  "isLimitReached": true,
  "upgradeRequired": true,
  "requestId": "req_1234567890_abc123"
}
```

### 4. **Rate Limiting**
```
🚫 [Chat API] req_1234567890_abc123 Rate limit exceeded for 192.168.1.100: Too many requests per minute
```

**Frontend Response:**
```json
{
  "error": "Too many requests per minute",
  "response": "Too many requests. Please wait a moment before trying again.",
  "isRateLimit": true,
  "requestId": "req_1234567890_abc123"
}
```

### 5. **OpenAI Quota Exceeded (HTTP 429)**
```
❌ [Chat API] req_1234567890_abc123 OPENAI API ERROR: {
  "status": 429,
  "statusText": "Too Many Requests",
  "error": {
    "error": {
      "message": "Rate limit reached for requests",
      "type": "requests"
    }
  }
}
```

**Frontend Response:**
```json
{
  "error": "OpenAI API error: 429",
  "response": "OpenAI quota exceeded. Please try again later or contact support.",
  "errorType": "quota_exceeded",
  "requestId": "req_1234567890_abc123"
}
```

### 6. **OpenAI Authentication Error (HTTP 401)**
```
❌ [Chat API] req_1234567890_abc123 OPENAI API ERROR: {
  "status": 401,
  "statusText": "Unauthorized",
  "error": {
    "error": {
      "message": "Invalid API key provided"
    }
  }
}
```

**Frontend Response:**
```json
{
  "error": "OpenAI API error: 401",
  "response": "API authentication failed. Please contact support.",
  "errorType": "auth_error",
  "requestId": "req_1234567890_abc123"
}
```

### 7. **Supabase Database Error**
```
❌ [Chat API] req_1234567890_abc123 USAGE CHECK ERROR: {
  "error": "Can't reach database server at db.gxthnrdeuhiykybpfrae.supabase.co:5432",
  "stack": "Error: Can't reach database...",
  "userId": "user123"
}
```

**Frontend Response:**
```json
{
  "error": "Usage check failed",
  "response": "Unable to verify your usage limits. Please try again.",
  "requestId": "req_1234567890_abc123"
}
```

### 8. **Knowledge Retrieval Error**
```
❌ [Chat API] req_1234567890_abc123 KNOWLEDGE RETRIEVAL ERROR: {
  "error": "Function match_documents does not exist",
  "stack": "Error: Function match_documents...",
  "query": "How do I create a marketing strategy..."
}
⚠️ [Chat API] req_1234567890_abc123 Continuing without knowledge due to error
```

**Result:** Request continues without knowledge context (graceful degradation)

### 9. **Network/Connection Error**
```
❌ [Chat API] req_1234567890_abc123 OPENAI REQUEST ERROR: {
  "error": "fetch failed",
  "name": "TypeError",
  "requestId": "req_1234567890_abc123"
}
```

**Frontend Response:**
```json
{
  "error": "OpenAI request failed",
  "response": "I'm unable to process your request right now. Please check your internet connection and try again.",
  "errorType": "network_error",
  "requestId": "req_1234567890_abc123"
}
```

### 10. **Success Response**
```
🚀 [Chat API] req_1234567890_abc123 Request received
✅ [Chat API] req_1234567890_abc123 Environment variables validated
✅ [Chat API] req_1234567890_abc123 User authenticated: user123
📊 [Chat API] req_1234567890_abc123 Usage check result: { "allowed": true, "usage": 15, "limit": 20 }
💬 [Chat API] req_1234567890_abc123 Processing message: { "messageLength": 25, "model": "gpt-4o-mini", "temperature": 0.7, "messagePreview": "Hello, how can you help..." }
🤖 [Chat API] req_1234567890_abc123 Calling OpenAI API: { "model": "gpt-4o-mini", "temperature": 0.7, "hasKnowledge": false, "messageCount": 1, "maxTokens": 3500 }
📥 [Chat API] req_1234567890_abc123 OpenAI response: { "id": "chatcmpl-123", "model": "gpt-4o-mini", "usage": { "total_tokens": 150 }, "responseLength": 245 }
✅ [Chat API] req_1234567890_abc123 Usage incremented for user user123
📤 [Chat API] req_1234567890_abc123 Sending successful response: { "responseLength": 245, "hasKnowledge": false, "sourcesCount": 0, "usage": { "total_tokens": 150 } }
```

## Testing Instructions

### Local Development Testing (npm run dev)

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Monitor logs in terminal** - All error logs will appear with detailed information

3. **Test scenarios:**

   **Missing API Key Test:**
   - Temporarily rename `OPENAI_API_KEY` in `.env.local`
   - Restart server and try sending a message
   - Should see ENV ERROR logs

   **Rate Limiting Test:**
   - Send multiple rapid requests (if rate limiting is enabled)
   - Should see rate limit logs and appropriate user message

   **Invalid Message Test:**
   - Send empty message
   - Should see validation error

   **Network Error Simulation:**
   - Block internet or use invalid OpenAI endpoint
   - Should see network error handling

### Production Testing (Vercel)

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Monitor logs:**
   ```bash
   vercel logs [deployment-url] --follow
   ```

3. **Check Vercel Dashboard:**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on `/api/chat` function
   - View real-time logs and invocations

### Expected Log Patterns

#### Development Mode (Detailed Logs)
- Request IDs for tracing: `req_1234567890_abc123`
- Stack traces included
- Full request/response details
- Debug information for troubleshooting

#### Production Mode (Minimal Logs)
- Request IDs for tracing: `req_1234567890_abc123`
- Error messages without stack traces
- Essential debugging info only
- No sensitive data exposure

## Debugging Checklist

When debugging errors, look for these log patterns:

1. **Request ID** - Each request has unique ID for tracing
2. **Error Type** - Categorized errors (env, auth, openai, supabase, etc.)
3. **User ID** - When available for user-specific issues
4. **Timestamp** - All errors include timestamp
5. **Stack Trace** - Available in development mode

## Frontend Error Display

The frontend now shows specific error messages instead of generic "error processing request":

- ✅ **OpenAI quota exceeded** → "OpenAI quota exceeded. Please try again later or contact support."
- ✅ **Authentication failed** → "Authentication failed. Please refresh the page and sign in again."
- ✅ **Usage limits reached** → "You have reached your chat limit. Upgrade to Pro for unlimited chats."
- ✅ **Rate limiting** → "Too many requests. Please wait a moment before trying again."
- ✅ **Network errors** → "Network error: Unable to connect to the server. Please check your internet connection and try again."

## Monitoring & Alerts

### Recommended Monitoring Setup

1. **Vercel Function Logs** - Monitor function execution and errors
2. **Error Tracking** - Consider adding Sentry or similar for error aggregation
3. **Performance Monitoring** - Track response times and usage patterns
4. **Database Monitoring** - Monitor Supabase connection health

### Key Metrics to Track

- **Error Rate** - Percentage of failed requests
- **Response Time** - Average API response times
- **Usage Patterns** - Chat usage by plan type
- **Rate Limiting** - Frequency of rate limit hits
- **OpenAI Costs** - Token usage and API costs

## Next Steps

1. **Test all error scenarios** in production
2. **Set up monitoring/alerting** for critical errors
3. **Add error aggregation service** (Sentry, LogRocket, etc.)
4. **Monitor user feedback** for any missed error cases
5. **Document additional edge cases** as they're discovered