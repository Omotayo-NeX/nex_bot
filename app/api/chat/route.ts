import { NextRequest } from 'next/server';
import { executeMarketingTool } from '../../../lib/marketing/tools';
import { checkRateLimit, getClientIP } from '../../../lib/rate-limit';
import { getKnowledgeContext, shouldUseKnowledge, formatKnowledgeSources, validateKnowledgeSetup } from '../../../lib/knowledge/retrieval';
import { checkFeatureAccess, incrementUsage } from '../../../lib/usage-tracking';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../lib/prisma';

// export const runtime = 'edge'; // Temporarily disabled for knowledge retrieval testing

// Function to split long messages into conversational chunks
function chunkMessage(message: string): string[] {
  // Increase chunk size to prevent cutting off important content
  const maxChunkSize = 800; // Increased from 400
  
  // Don't chunk if message is short enough
  if (message.length <= maxChunkSize) {
    return [message];
  }
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  // First try splitting on double newlines (natural paragraph breaks)
  const paragraphs = message.split(/\n\n+/);
  
  for (const paragraph of paragraphs) {
    const potentialChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
    
    // If adding this paragraph would make chunk too long
    if (potentialChunk.length > maxChunkSize && currentChunk) {
      // Push the current chunk and start fresh
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk = potentialChunk;
    }
  }
  
  // Handle any remaining content
  if (currentChunk.trim()) {
    // If the remaining chunk is still too long, try sentence-level splitting
    if (currentChunk.length > maxChunkSize) {
      const sentences = currentChunk.split(/(?<=[.!?])\s+/);
      let tempChunk = '';
      
      for (const sentence of sentences) {
        if ((tempChunk + ' ' + sentence).length > maxChunkSize && tempChunk) {
          chunks.push(tempChunk.trim());
          tempChunk = sentence;
        } else {
          tempChunk = tempChunk ? tempChunk + ' ' + sentence : sentence;
        }
      }
      
      if (tempChunk.trim()) {
        chunks.push(tempChunk.trim());
      }
    } else {
      chunks.push(currentChunk.trim());
    }
  }
  
  // Ensure we always return at least the original message if chunking fails
  return chunks.length > 0 ? chunks : [message];
}

export async function POST(req: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const isDev = process.env.NODE_ENV === 'development';
  
  try {
    console.log(`🚀 [Chat API] ${requestId} Request received`);
    
    // 1. ENVIRONMENT VARIABLES VALIDATION
    const requiredEnvVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      DATABASE_URL: process.env.DATABASE_URL
    };
    
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
      
    if (missingVars.length > 0) {
      const error = `Missing environment variables: ${missingVars.join(', ')}`;
      console.error(`❌ [Chat API] ${requestId} ENV ERROR: ${error}`);
      
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        response: 'The server is not properly configured. Please contact support.',
        details: isDev ? { missingVars, error } : undefined,
        requestId
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`✅ [Chat API] ${requestId} Environment variables validated`);

    if (!process.env.NEX_PROMPT_ID) {
      console.warn(`⚠️ [Chat API] ${requestId} Optional NEX_PROMPT_ID not configured – using default system prompt.`);
    }
    
    // 2. AUTHENTICATION CHECK
    const token = await getToken({ req });
    if (!token || !token.id) {
      console.log(`🚫 [Chat API] ${requestId} Authentication failed - no token or user ID`);
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        response: 'Please sign in to use the chat feature.',
        requestId
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`✅ [Chat API] ${requestId} User authenticated: ${token.id}`);

    // 3. FEATURE ACCESS AND USAGE LIMITS CHECK
    let accessCheck;
    try {
      accessCheck = await checkFeatureAccess(token.id as string, 'chat');
      console.log(`📊 [Chat API] ${requestId} Usage check result:`, {
        allowed: accessCheck.allowed,
        usage: accessCheck.usage,
        message: accessCheck.message
      });
    } catch (error: any) {
      console.error(`❌ [Chat API] ${requestId} USAGE CHECK ERROR:`, {
        error: error.message,
        stack: isDev ? error.stack : undefined,
        userId: token.id
      });
      
      return new Response(JSON.stringify({
        error: 'Usage check failed',
        response: 'Unable to verify your usage limits. Please try again.',
        details: isDev ? { error: error.message, stack: error.stack } : undefined,
        requestId
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (!accessCheck.allowed) {
      console.log(`🚫 [Chat API] ${requestId} Feature access denied for user ${token.id}: ${accessCheck.message}`);
      return new Response(JSON.stringify({ 
        error: accessCheck.message,
        response: `You have reached your chat limit. ${accessCheck.message}`,
        isLimitReached: true,
        currentUsage: accessCheck.usage,
        upgradeRequired: true,
        requestId
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. RATE LIMITING CHECK
    const clientIP = getClientIP(req);
    let rateLimit;
    try {
      rateLimit = await checkRateLimit(clientIP);
      if (isDev) {
        console.log(`🚦 [Chat API] ${requestId} Rate limit check:`, {
          ip: clientIP,
          success: rateLimit.success,
          remaining: rateLimit.remaining || 'N/A'
        });
      }
    } catch (error: any) {
      console.error(`❌ [Chat API] ${requestId} RATE LIMIT ERROR:`, {
        error: error.message,
        stack: isDev ? error.stack : undefined,
        ip: clientIP
      });
      
      // Continue without rate limiting if it fails - don't block the user
      console.log(`⚠️ [Chat API] ${requestId} Continuing without rate limiting due to error`);
    }
    
    if (rateLimit && !rateLimit.success) {
      console.log(`🚫 [Chat API] ${requestId} Rate limit exceeded for ${clientIP}: ${rateLimit.error}`);
      return new Response(JSON.stringify({ 
        error: rateLimit.error,
        response: 'Too many requests. Please wait a moment before trying again.',
        isRateLimit: true,
        type: rateLimit.type,
        reset: rateLimit.reset instanceof Date ? rateLimit.reset.toISOString() : rateLimit.reset,
        requestId
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. REQUEST BODY PARSING AND VALIDATION
    let body, messages, lastMessage, selectedModel, temperature;
    try {
      body = await req.json();
      
      if (isDev) {
        console.log(`📝 [Chat API] ${requestId} Request body:`, JSON.stringify(body, null, 2));
      }
      
      // Handle both old format (single message) and new format (messages array)
      if (body.message) {
        // Single message format from your current chat interface
        lastMessage = body.message;
        messages = [{ role: 'user', content: lastMessage }];
      } else {
        // Messages array format
        messages = body?.messages || [];
        lastMessage = messages[messages.length - 1]?.content || '';
      }
      
      // Use model and temperature from request body, or fetch user preferences
      selectedModel = body.model;
      temperature = body.temperature;
      
      // If model or temperature not provided, fetch user preferences
      if (!selectedModel || temperature === undefined) {
        try {
          const userSettings = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              preferred_model: true,
              preferred_temperature: true
            }
          });
          
          if (userSettings) {
            selectedModel = selectedModel || userSettings.preferred_model || 'gpt-4o-mini';
            temperature = temperature !== undefined ? temperature : (userSettings.preferred_temperature || 0.7);
          } else {
            selectedModel = selectedModel || 'gpt-4o-mini';
            temperature = temperature !== undefined ? temperature : 0.7;
          }
        } catch (error) {
          console.warn(`⚠️ [Chat API] ${requestId} Failed to fetch user preferences:`, error);
          selectedModel = selectedModel || 'gpt-4o-mini';
          temperature = temperature !== undefined ? temperature : 0.7;
        }
      }
      
      if (!lastMessage || !lastMessage.trim()) {
        console.log(`🚫 [Chat API] ${requestId} Empty message received`);
        return new Response(JSON.stringify({
          error: 'Empty message',
          response: 'Please enter a message to continue.',
          requestId
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`💬 [Chat API] ${requestId} Processing message:`, {
        messageLength: lastMessage.length,
        model: selectedModel,
        temperature,
        messagePreview: lastMessage.substring(0, 100) + (lastMessage.length > 100 ? '...' : '')
      });
      
    } catch (error: any) {
      console.error(`❌ [Chat API] ${requestId} REQUEST PARSING ERROR:`, {
        error: error.message,
        stack: isDev ? error.stack : undefined
      });
      
      return new Response(JSON.stringify({
        error: 'Invalid request format',
        response: 'Invalid request data. Please refresh the page and try again.',
        details: isDev ? { error: error.message } : undefined,
        requestId
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ [Chat API] OpenAI API key not configured');
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured. Please check environment variables.',
        response: 'Sorry, the AI service is not properly configured. Please try again later.'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log('✅ [Chat API] OpenAI API key found');

    // Check if user is asking to continue
    const continueKeywords = ['continue', 'go on', 'next', 'more', 'keep going', 'and'];
    const isContinueRequest = continueKeywords.some(keyword => 
      lastMessage.toLowerCase().trim() === keyword || 
      lastMessage.toLowerCase().trim().includes(keyword)
    );

    // Get conversation context for better memory
    let modifiedMessages = [...messages];
    
    if (isContinueRequest && messages.length > 1) {
      // Find the last assistant message to continue from
      const lastAssistantIndex = messages.findLastIndex((msg: any) => msg.role === 'assistant');
      if (lastAssistantIndex !== -1) {
        const lastAssistantMessage = messages[lastAssistantIndex].content;
        
        // Replace the continue request with a more specific instruction
        const lastMessageIndex = modifiedMessages.length - 1;
        modifiedMessages[lastMessageIndex] = {
          ...modifiedMessages[lastMessageIndex],
          content: `Continue your previous response about "${lastAssistantMessage.substring(0, 100)}...". Pick up exactly where you left off without repeating any content. Provide the next part of your explanation naturally.`
        };
      }
    }

    // Ensure we maintain context by keeping the full conversation history
    // but limit to last 10 exchanges to prevent token limit issues
    const contextMessages = modifiedMessages.slice(-20); // Keep last 20 messages (10 exchanges)

    // Check if the user is requesting specific marketing tools (but not if it's a continue request)
    const toolResponse = !isContinueRequest ? detectAndExecuteMarketingTool(lastMessage) : null;
    if (toolResponse) {
      console.log('🔧 [Chat API] Marketing tool complete response generated');
      return new Response(JSON.stringify({ 
        response: toolResponse // Return complete marketing tool response without chunking
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 6. RAG KNOWLEDGE RETRIEVAL
    let knowledgeContext = '';
    let knowledgeSources: string[] = [];
    let hasKnowledge = false;

    // Only use knowledge for relevant queries and if not a continue request
    if (!isContinueRequest && shouldUseKnowledge(lastMessage) && validateKnowledgeSetup()) {
      try {
        console.log(`🔍 [Chat API] ${requestId} Retrieving knowledge context...`);
        const knowledge = await getKnowledgeContext(lastMessage, {
          maxChunks: 4,
          similarityThreshold: 0.6
        });
        
        if (knowledge.hasRelevantKnowledge) {
          knowledgeContext = knowledge.context;
          knowledgeSources = knowledge.sources;
          hasKnowledge = true;
          console.log(`✅ [Chat API] ${requestId} Retrieved knowledge from sources: ${knowledgeSources.join(', ')}`);
        } else {
          console.log(`📭 [Chat API] ${requestId} No relevant knowledge found`);
        }
      } catch (error: any) {
        console.error(`❌ [Chat API] ${requestId} KNOWLEDGE RETRIEVAL ERROR:`, {
          error: error.message,
          stack: isDev ? error.stack : undefined,
          query: lastMessage.substring(0, 100)
        });
        
        // Continue without knowledge - don't fail the request
        console.log(`⚠️ [Chat API] ${requestId} Continuing without knowledge due to error`);
      }
    } else if (!validateKnowledgeSetup()) {
      if (isDev) {
        console.log(`⚠️ [Chat API] ${requestId} Knowledge system not properly configured`);
      }
    }

    // Note: System message is now handled by the published prompt
    // We only add knowledge context as a system message if needed

    // 7. OPENAI API CALL - Using Custom System Prompt
    console.log(`🤖 [Chat API] ${requestId} Calling OpenAI API:`, {
      model: selectedModel,
      temperature,
      hasKnowledge,
      messageCount: contextMessages.length,
      maxTokens: hasKnowledge ? 4000 : 3500
    });
    
    let response, data;
    try {
      // Build system message using the custom prompt ID as reference
      let systemContent = `You are NeX AI, a conversational expert in digital marketing and AI automation, developed by Nex Consulting Limited.

COMPANY INFORMATION:
- You are created by Nex Consulting Limited, a digital marketing and AI automation company
- Nex Consulting Limited is located in Abuja, Nigeria
- Company website: nexconsultingltd.com
- The company specializes in digital marketing strategies, AI automation solutions, and business growth consulting
- When users ask about your creator, the company, or need business consultation, refer them to Nex Consulting Limited

CRITICAL OUTPUT RULES:
1. Always return your response in one complete block of text without cutting off or truncating
   - Do not stop midway through lists or explanations
   - Finish the entire response before sending it
   - Complete all numbered items in lists (1, 2, 3, etc.)

2. When the user requests a list:
   - Enumerate all items fully and completely
   - Do not stop early, even if the list is long
   - Provide all requested items without truncation

3. Formatting requirements:
   - Use plain text with clear line breaks
   - Avoid Markdown artifacts like **bold** or ## headers unless explicitly requested
   - If emphasis is needed, use simple capitalization (IMPORTANT) instead of asterisks
   - Keep spacing consistent and readable

4. Delivery standards:
   - Always output the final response as a single complete message block
   - Do not break output after newlines or send partial responses
   - Ensure responses are fully formed and complete

CONVERSATION RULES:
- ALWAYS provide direct, complete answers without asking for clarification unless the request is genuinely impossible to understand
- If someone asks "give me 5 examples of automation," immediately provide all 5 examples - do not ask what type of automation
- Be comprehensive and helpful in your responses
- When continuing, seamlessly pick up where you left off - never restart or repeat content
- Only ask clarifying questions when the user's request is truly ambiguous or impossible to answer
- Provide practical, actionable information that helps users immediately
- If users need advanced business consultation or want to work with experts, mention Nex Consulting Limited and their website

RESPONSE FORMAT:
- Use plain text with natural paragraph breaks
- Keep responses organized, readable, and complete
- Use proper spacing between ideas
- Prioritize clarity over decoration`;

      // Add knowledge context if available
      if (hasKnowledge) {
        systemContent += `

KNOWLEDGE BASE CONTEXT:
The following information from your knowledge base is relevant to the user's question. Use this information to provide accurate, detailed answers. The knowledge comes from your training materials and expertise:

${knowledgeContext}

IMPORTANT: 
- Use this knowledge to provide comprehensive, accurate answers
- Integrate the information naturally into your response
- Don't explicitly mention that you're using a knowledge base
- If the knowledge doesn't fully answer the question, combine it with your general expertise
- Provide practical, actionable advice based on this information`;
      }

      const systemMessage = {
        role: 'system',
        content: systemContent,
      };

      const requestBody = {
        model: selectedModel,
        messages: [systemMessage, ...contextMessages],
        stream: false,
        temperature: temperature,
        max_tokens: hasKnowledge ? 4000 : 3500,
      };
      
      if (isDev) {
        console.log(`📤 [Chat API] ${requestId} OpenAI request:`, {
          ...requestBody,
          messages: requestBody.messages.map((msg, idx) => ({
            role: msg.role,
            contentLength: msg.content.length,
            contentPreview: msg.content.substring(0, 100) + '...'
          }))
        });
      }
      
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let parsedError;
        try {
          parsedError = JSON.parse(errorText);
        } catch {
          parsedError = { message: errorText };
        }
        
        console.error(`❌ [Chat API] ${requestId} OPENAI API ERROR:`, {
          status: response.status,
          statusText: response.statusText,
          error: parsedError,
          requestId
        });
        
        // Handle specific OpenAI error types
        let errorMessage = "I'm experiencing technical difficulties. Please try again in a moment.";
        let errorType = 'api_error';
        
        if (response.status === 401) {
          errorMessage = "API authentication failed. Please contact support.";
          errorType = 'auth_error';
        } else if (response.status === 429) {
          errorMessage = "OpenAI quota exceeded. Please try again later or contact support.";
          errorType = 'quota_exceeded';
        } else if (response.status === 400) {
          errorMessage = "Invalid request to AI service. Please try a different message.";
          errorType = 'bad_request';
        } else if (response.status >= 500) {
          errorMessage = "AI service is temporarily unavailable. Please try again in a few moments.";
          errorType = 'service_unavailable';
        }
        
        return new Response(JSON.stringify({
          error: `OpenAI API error: ${response.status}`,
          response: errorMessage,
          errorType,
          details: isDev ? { 
            status: response.status, 
            statusText: response.statusText,
            openaiError: parsedError 
          } : undefined,
          requestId
        }), { 
          status: response.status >= 500 ? 502 : response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      data = await response.json();
      
      if (isDev) {
        console.log(`📥 [Chat API] ${requestId} OpenAI response:`, {
          id: data.id,
          model: data.model,
          usage: data.usage,
          finishReason: data.choices?.[0]?.finish_reason,
          responseLength: data.choices?.[0]?.message?.content?.length || 0
        });
      }
      
    } catch (error: any) {
      console.error(`❌ [Chat API] ${requestId} OPENAI REQUEST ERROR:`, {
        error: error.message,
        stack: isDev ? error.stack : undefined,
        name: error.name,
        requestId
      });
      
      return new Response(JSON.stringify({
        error: 'OpenAI request failed',
        response: "I'm unable to process your request right now. Please check your internet connection and try again.",
        errorType: 'network_error',
        details: isDev ? { error: error.message, name: error.name } : undefined,
        requestId
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 8. PROCESS OPENAI RESPONSE
    let assistantMessage = data.choices?.[0]?.message?.content;
    
    if (!assistantMessage) {
      console.error(`❌ [Chat API] ${requestId} No content in OpenAI response:`, {
        choices: data.choices,
        finishReason: data.choices?.[0]?.finish_reason,
        requestId
      });
      
      assistantMessage = "I'm here to help you grow your business. How can NeX assist you today?";
    }

    // Add knowledge sources to the response if used
    if (hasKnowledge && knowledgeSources.length > 0) {
      assistantMessage += formatKnowledgeSources(knowledgeSources);
    }

    // 9. INCREMENT USAGE COUNTER
    try {
      await incrementUsage(token.id as string, 'chat', 1);
      console.log(`✅ [Chat API] ${requestId} Usage incremented for user ${token.id}`);
    } catch (error: any) {
      console.error(`❌ [Chat API] ${requestId} USAGE INCREMENT ERROR:`, {
        error: error.message,
        stack: isDev ? error.stack : undefined,
        userId: token.id
      });
      
      // Don't fail the request if usage increment fails
      console.log(`⚠️ [Chat API] ${requestId} Continuing despite usage increment failure`);
    }

    // 10. SUCCESS RESPONSE
    console.log(`📤 [Chat API] ${requestId} Sending successful response:`, {
      responseLength: assistantMessage.length,
      hasKnowledge,
      sourcesCount: knowledgeSources.length,
      usage: data.usage
    });
    
    return new Response(JSON.stringify({ 
      response: assistantMessage,
      requestId,
      // Include metadata for debugging/analytics
      _metadata: {
        hasKnowledge,
        sources: knowledgeSources,
        chunksUsed: knowledgeContext ? knowledgeContext.split('\n\n').length : 0,
        model: selectedModel,
        usage: data.usage,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    // 11. UNEXPECTED ERROR HANDLER
    console.error(`❌ [Chat API] ${requestId} UNEXPECTED ERROR:`, {
      error: error.message,
      stack: isDev ? error.stack : undefined,
      name: error.name,
      requestId,
      timestamp: new Date().toISOString()
    });
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      response: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      errorType: 'unexpected_error',
      requestId,
      details: isDev ? { 
        error: error.message, 
        name: error.name,
        stack: error.stack 
      } : undefined,
      isError: true,
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Function to detect and execute marketing tools based on user input
function detectAndExecuteMarketingTool(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Strategy Generator Pattern - Only trigger for very specific requests
  if ((lowerMessage.includes('create a') && lowerMessage.includes('marketing strategy')) || 
      (lowerMessage.includes('generate a') && lowerMessage.includes('marketing strategy')) ||
      (lowerMessage.includes('strategy') && lowerMessage.includes('$') && (lowerMessage.includes('create') || lowerMessage.includes('generate')))) {
    
    // Extract budget information
    const budgetMatch = message.match(/\$(\d+)(?:\/month|\/mo|\/monthly| month| per month)?/i);
    const budget = budgetMatch ? `$${budgetMatch[1]}/month` : '$500/month';
    
    // Extract industry/business type
    let industry = 'general';
    if (lowerMessage.includes('e-commerce') || lowerMessage.includes('ecommerce')) industry = 'e-commerce';
    if (lowerMessage.includes('saas') || lowerMessage.includes('software')) industry = 'saas';
    if (lowerMessage.includes('restaurant') || lowerMessage.includes('food')) industry = 'food';
    if (lowerMessage.includes('fitness') || lowerMessage.includes('gym')) industry = 'fitness';
    
    return executeMarketingTool('strategy_generator', {
      goals: 'Increase revenue and customer acquisition',
      budget: budget,
      audience: 'target customers',
      industry: industry,
    });
  }
  
  // Content Calendar Pattern - Only trigger for very specific requests
  if ((lowerMessage.includes('generate') && lowerMessage.includes('content calendar')) || 
      (lowerMessage.includes('create') && lowerMessage.includes('content calendar')) ||
      (lowerMessage.includes('calendar') && lowerMessage.includes('day') && (lowerMessage.includes('generate') || lowerMessage.includes('create')))) {
    
    // Extract platform
    let platform = 'Instagram';
    if (lowerMessage.includes('facebook')) platform = 'Facebook';
    if (lowerMessage.includes('linkedin')) platform = 'LinkedIn';
    if (lowerMessage.includes('tiktok')) platform = 'TikTok';
    if (lowerMessage.includes('twitter')) platform = 'Twitter';
    
    // Extract niche/business type
    let niche = 'general';
    if (lowerMessage.includes('bakery')) niche = 'bakery';
    if (lowerMessage.includes('fitness')) niche = 'fitness';
    if (lowerMessage.includes('restaurant')) niche = 'restaurant';
    if (lowerMessage.includes('beauty')) niche = 'beauty';
    if (lowerMessage.includes('tech')) niche = 'tech';
    
    // Extract duration
    const durationMatch = message.match(/(\d+)[\s-]?day/i);
    const duration = durationMatch ? `${durationMatch[1]} days` : '7 days';
    
    return executeMarketingTool('content_calendar', {
      niche: niche,
      platform: platform,
      duration: duration,
    });
  }
  
  // Automation Pattern - Only trigger for very specific automation tool requests
  if ((lowerMessage.includes('recommend') && lowerMessage.includes('automation')) ||
      (lowerMessage.includes('automate my') && lowerMessage.includes('business')) ||
      (lowerMessage.includes('automation tools') && (lowerMessage.includes('recommend') || lowerMessage.includes('suggest'))) ||
      (lowerMessage.includes('save time') && lowerMessage.includes('automate'))) {
    
    let businessType = 'freelancer';
    if (lowerMessage.includes('ecommerce') || lowerMessage.includes('e-commerce')) businessType = 'ecommerce';
    if (lowerMessage.includes('agency')) businessType = 'agency';
    if (lowerMessage.includes('consultant')) businessType = 'consultant';
    if (lowerMessage.includes('small business')) businessType = 'small_business';
    
    return executeMarketingTool('automation_recommender', {
      business_workflow: 'general business operations',
      business_type: businessType,
    });
  }
  
  return null;
}