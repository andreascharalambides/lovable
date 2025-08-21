import OpenAI from 'openai';
import type { Message } from '../stores/app';

const SYSTEM_PROMPT = `You are an expert Svelte developer. Generate complete, production-ready Svelte components based on user requirements.

CRITICAL RULES:
1. Output ONLY valid Svelte component code - no explanations, no markdown
2. Use Svelte 4+ syntax with script, style, and markup sections
3. Make components fully functional and interactive
4. Use plain JavaScript (no TypeScript) in script tags
5. Include proper event handlers, state management, and reactivity
6. Add professional styling with scoped CSS
7. Make components responsive and accessible
8. Use semantic HTML and ARIA attributes where appropriate
9. Include smooth transitions and animations where suitable
10. Ensure code is clean, optimized, and follows best practices

Component Requirements:
- Self-contained (no external dependencies except Svelte)
- Production-ready with error handling
- Responsive design (mobile-first)
- Accessible (WCAG 2.1 AA compliant)
- Performance optimized
- Clean, maintainable code

Output Format: Return ONLY the complete .svelte file content, no code blocks or explanations.`;

export class LLMService {
    private client: OpenAI | null = null;
    private abortController: AbortController | null = null;

    initialize(apiKey: string) {
        this.client = new OpenAI({
            apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    async generateSvelteComponent(
        prompt: string,
        conversationHistory: Message[] = [],
        existingCode?: string
    ): Promise<string> {
        if (!this.client) {
            throw new Error('API key not configured');
        }

        // Cancel any pending request
        this.abort();
        this.abortController = new AbortController();

        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];

        // Add conversation context if iterating
        if (existingCode) {
            messages.push({
                role: 'system',
                content: `Current component to iterate on:\n\n${existingCode}`
            });
        }

        // Add conversation history (last 5 messages for context)
        const recentHistory = conversationHistory.slice(-5);
        recentHistory.forEach(msg => {
            if (msg.role === 'user') {
                messages.push({ role: 'user', content: msg.content });
            }
        });

        // Add current prompt
        messages.push({ role: 'user', content: prompt });

        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages,
                temperature: 0.7,
                max_tokens: 4000,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            }, {
                signal: this.abortController.signal
            });

            const code = response.choices[0]?.message?.content || '';
            return this.cleanCode(code);

        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Generation cancelled');
            }

            if (error.status === 401) {
                throw new Error('Invalid API key');
            }

            if (error.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later');
            }

            throw new Error(error.message || 'Failed to generate component');
        }
    }

    private cleanCode(code: string): string {
        // Remove any markdown formatting
        let cleaned = code
            .replace(/```(?:svelte|html|javascript)?\n?/g, '')
            .replace(/```/g, '')
            .trim();

        // Ensure valid Svelte structure
        if (!cleaned.includes('<script') && !cleaned.includes('<style') && !cleaned.startsWith('<')) {
            // Wrap in basic structure if needed
            cleaned = `<script>
  // Component logic
  let message = 'Component generated';
</script>

<div>
  <p>{message}</p>
</div>

<style>
  div {
    padding: 1rem;
  }
</style>`;
        }

        return cleaned;
    }

    abort() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    isInitialized(): boolean {
        return this.client !== null;
    }
}

export const llmService = new LLMService();