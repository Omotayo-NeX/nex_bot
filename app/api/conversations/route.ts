import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// GET /api/conversations - Get all conversations for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Use Supabase authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1, // Only get the first message for preview
          select: {
            content: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      isPinned: conv.isPinned,
      timestamp: conv.updatedAt,
      preview: conv.messages[0]?.content.substring(0, 100) || '',
      messageCount: conv._count.messages
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(req: NextRequest) {
  try {
    // Use Supabase authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { title, messages } = await req.json();

    if (!title || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Title and messages are required' },
        { status: 400 }
      );
    }

    // Create conversation with messages in a transaction
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title,
        messages: {
          create: messages.map((msg: any, index: number) => ({
            role: msg.role,
            content: msg.content,
            createdAt: new Date(Date.now() + index) // Ensure proper ordering
          }))
        }
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}