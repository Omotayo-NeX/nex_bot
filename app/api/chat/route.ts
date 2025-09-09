import { NextRequest } from 'next/server';
import { executeMarketingTool } from '../../../lib/marketing/tools';
import { checkRateLimit, getClientIP } from '../../../lib/rate-limit';
import { getKnowledgeContext, shouldUseKnowledge, formatKnowledgeSources, validateKnowledgeSetup } from '../../../lib/knowledge/retrieval';
import { checkFeatureAccess, incrementUsage } from '../../../lib/usage-tracking';
import { getToken } from 'next-auth/jwt';

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
  try {
    console.log('🚀 [Chat API] Request received');
    
    // Check authentication
    const token = await getToken({ req });
    if (!token || !token.id) {
      return new Response(JSON.stringify({ 
        error: 'Authentication required',
        response: 'Please sign in to use the chat feature.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check feature access and usage limits
    const accessCheck = await checkFeatureAccess(token.id as string, 'chat');
    if (!accessCheck.allowed) {
      console.log(`🚫 [Chat API] Feature access denied for user ${token.id}: ${accessCheck.message}`);
      return new Response(JSON.stringify({ 
        error: accessCheck.message,
        isLimitReached: true,
        currentUsage: accessCheck.usage,
        upgradeRequired: true
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    
    // Check rate limits
    const rateLimit = await checkRateLimit(clientIP);
    if (!rateLimit.success) {
      console.log(`🚫 [Chat API] Rate limit exceeded for ${clientIP}: ${rateLimit.error}`);
      return new Response(JSON.stringify({ 
        error: rateLimit.error,
        isRateLimit: true,
        type: rateLimit.type,
        reset: rateLimit.reset instanceof Date ? rateLimit.reset.toISOString() : rateLimit.reset,
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    console.log('📝 [Chat API] Request body:', JSON.stringify(body, null, 2));
    
    // Handle both old format (single message) and new format (messages array)
    let messages, lastMessage;
    if (body.message) {
      // Single message format from your current chat interface
      lastMessage = body.message;
      messages = [{ role: 'user', content: lastMessage }];
    } else {
      // Messages array format
      messages = body?.messages || [];
      lastMessage = messages[messages.length - 1]?.content || '';
    }
    
    console.log('💬 [Chat API] Processing message:', lastMessage);

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

    // 🧠 RAG KNOWLEDGE RETRIEVAL
    let knowledgeContext = '';
    let knowledgeSources: string[] = [];
    let hasKnowledge = false;

    // Only use knowledge for relevant queries and if not a continue request
    if (!isContinueRequest && shouldUseKnowledge(lastMessage) && validateKnowledgeSetup()) {
      try {
        console.log('🔍 [Chat API] Retrieving knowledge context...');
        const knowledge = await getKnowledgeContext(lastMessage, {
          maxChunks: 4,
          similarityThreshold: 0.6
        });
        
        if (knowledge.hasRelevantKnowledge) {
          knowledgeContext = knowledge.context;
          knowledgeSources = knowledge.sources;
          hasKnowledge = true;
          console.log(`✅ [Chat API] Retrieved knowledge from sources: ${knowledgeSources.join(', ')}`);
        } else {
          console.log('📭 [Chat API] No relevant knowledge found');
        }
      } catch (error: any) {
        console.error('❌ [Chat API] Knowledge retrieval failed:', error);
        // Continue without knowledge - don't fail the request
      }
    }

    // Build system message with knowledge context
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

    console.log(`🤖 [Chat API] Calling OpenAI API... ${hasKnowledge ? '(with knowledge context)' : '(without knowledge)'}`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...contextMessages],
        stream: false,
        temperature: 0.7,
        max_tokens: hasKnowledge ? 4000 : 3500, // Increased tokens for complete responses
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Chat API] OpenAI API error:', response.status, response.statusText, errorText);
      return new Response(JSON.stringify({
        error: `OpenAI API error: ${response.status} ${response.statusText}`,
        response: "I'm experiencing technical difficulties. Please try again in a moment."
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('✅ [Chat API] OpenAI API response received');
    
    let assistantMessage =
      data.choices[0]?.message?.content ||
      "I'm here to help you grow your business. How can NeX assist you today?";

    // Add knowledge sources to the response if used
    if (hasKnowledge && knowledgeSources.length > 0) {
      assistantMessage += formatKnowledgeSources(knowledgeSources);
    }

    // Increment usage counter for successful chat
    await incrementUsage(token.id as string, 'chat', 1);
    console.log(`✅ [Chat API] Usage incremented for user ${token.id}`);

    console.log('📤 [Chat API] Sending complete response to client');
    return new Response(JSON.stringify({ 
      response: assistantMessage, // Return complete response without chunking
      // Include knowledge metadata for debugging/analytics
      _metadata: hasKnowledge ? {
        hasKnowledge: true,
        sources: knowledgeSources,
        chunksUsed: knowledgeContext ? knowledgeContext.split('\n\n').length : 0
      } : { hasKnowledge: false }
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ [Chat API] Unexpected error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      response: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
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