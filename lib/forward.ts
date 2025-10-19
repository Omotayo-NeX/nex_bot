/**
 * Webhook Forwarding Utility
 *
 * Provides retry logic for forwarding Paystack webhooks to external app endpoints.
 * Used by the NeXAI Paystack router to relay events to other NeX Consulting apps.
 */

interface ForwardOptions {
  url: string;
  body: string;
  attempts?: number;
  timeoutMs?: number;
}

interface ForwardResult {
  ok: boolean;
  status?: number;
  text?: string;
  attempt?: number;
  error?: string;
}

/**
 * Forward webhook payload with exponential backoff retry logic
 *
 * @param options - Forwarding configuration
 * @returns Result of the forwarding attempt
 */
export async function forwardWithRetry(options: ForwardOptions): Promise<ForwardResult> {
  const {
    url,
    body,
    attempts = parseInt(process.env.FORWARDING_RETRY_ATTEMPTS || '3'),
    timeoutMs = parseInt(process.env.FORWARDING_TIMEOUT_MS || '6000'),
  } = options;

  let lastError: string = '';

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-router-source': 'nexai-paystack-router',
        },
        body: body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          text: responseText,
          attempt,
        };
      }

      // Non-OK response, but we got a response
      lastError = `HTTP ${response.status}: ${responseText.substring(0, 200)}`;
      console.warn(`⚠️ Forward attempt ${attempt}/${attempts} failed: ${lastError}`);

      // If we got a response but it wasn't OK, retry
      if (attempt < attempts) {
        await exponentialBackoff(attempt);
      }

    } catch (error: any) {
      lastError = error.name === 'AbortError'
        ? `Timeout after ${timeoutMs}ms`
        : error.message || String(error);

      console.error(`❌ Forward attempt ${attempt}/${attempts} error: ${lastError}`);

      // Retry on network errors or timeouts
      if (attempt < attempts) {
        await exponentialBackoff(attempt);
      }
    }
  }

  // All attempts failed
  return {
    ok: false,
    error: `Failed after ${attempts} attempts. Last error: ${lastError}`,
  };
}

/**
 * Exponential backoff delay
 * Wait time: 300ms → 600ms → 1200ms
 */
async function exponentialBackoff(attempt: number): Promise<void> {
  const baseDelay = 300; // milliseconds
  const delay = baseDelay * Math.pow(2, attempt - 1);
  console.log(`⏳ Waiting ${delay}ms before retry...`);
  await new Promise(resolve => setTimeout(resolve, delay));
}
