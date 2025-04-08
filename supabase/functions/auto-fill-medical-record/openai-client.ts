
import OpenAI from "https://esm.sh/openai@4.20.1";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});
