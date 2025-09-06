import { NextRequest } from 'next/server';
import { executeMarketingTool } from '../../../lib/marketing/tools';

export const runtime = 'edge';

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
    const body = await req.json();
    const messages = body?.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || '';

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response('OpenAI API key not configured', { status: 500 });
    }

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
      const chunks = chunkMessage(toolResponse);
      return new Response(JSON.stringify({ 
        message: chunks[0],
        hasMore: chunks.length > 1,
        chunks: chunks.length > 1 ? chunks.slice(1) : undefined 
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemMessage = {
      role: 'system',
      content: `You are NeX AI, a conversational expert in digital marketing and AI automation.

CRITICAL CONVERSATION RULES:
- ALWAYS provide direct, complete answers without asking for clarification unless the request is genuinely impossible to understand
- If someone asks "give me 5 examples of automation," immediately provide 5 examples - do not ask what type of automation
- Be comprehensive and helpful in your responses
- Use clean, conversational text without markdown formatting symbols like ** or ##
- When continuing, seamlessly pick up where you left off - never restart or repeat content
- Only ask clarifying questions when the user's request is truly ambiguous or impossible to answer
- Provide practical, actionable information that helps users immediately

RESPONSE FORMAT:
- Use plain text with natural paragraph breaks
- No markdown symbols (**, ##, etc.) - use conversational language instead
- Keep responses organized but readable
- Use proper spacing between ideas`,
    };

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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        'OpenAI API error:',
        response.status,
        response.statusText,
        errorText,
      );
      return new Response(
        `OpenAI API error: ${response.status} ${response.statusText}`,
        { status: 500 },
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.choices[0]?.message?.content ||
      "I'm here to help you grow your business. How can NeX assist you today?";

    // Chunk the response for conversational flow
    const chunks = chunkMessage(assistantMessage);

    return new Response(JSON.stringify({ 
      message: chunks[0], // Return first chunk
      hasMore: chunks.length > 1,
      chunks: chunks.length > 1 ? chunks.slice(1) : undefined 
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      { status: 500 },
    );
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
