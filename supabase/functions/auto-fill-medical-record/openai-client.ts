import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const apiKey = Deno.env.get("OPENAI_API_KEY");
if (!apiKey) {
  throw new Error("OPENAI_API_KEY env var is required");
}

export const openai = new OpenAI({
  apiKey,
});