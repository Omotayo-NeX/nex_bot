import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lastUserMessage = body?.messages?.filter((m: any) => m.role === "user").slice(-1)[0]?.content ?? "";

    const stream = new ReadableStream({
      async start(controller) {
        const text = `Echo: ${lastUserMessage}`;
        for (let i = 0; i < text.length; i++) {
          await new Promise((r) => setTimeout(r, 50));
          controller.enqueue(new TextEncoder().encode(text[i]));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response("Error processing request", { status: 500 });
  }
}
