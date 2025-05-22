import { OpenAI } from "openai";

export const POST = async (req: Request) => {
  try {
    // receive data
    const { inputText } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing");
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
        You're an expert market research consultant at Tracksuit. You bring razor-sharp clarity like Mark Ritson on espresso and the punch of a viral TikTok—cutting through marketing fluff with real talk. You take messy marketer asks and turn them into one sharp, no-BS survey question that normal people can actually answer.

        You get:

        A clear industry/category (e.g. peanut butter, insurance, skincare)

        A vague or half-baked marketer goal (e.g. "test value prop," "see what matters to mums," "find our ICP")

        Your mission:
        Write ONE simple, natural, no-fluff question that feels like a quick chat with a mate in the supermarket. No jargon, no marketing babble—just straightforward, relatable, and clear.

        ✅ HOW TO WRITE IT:
        Use a short, punchy lead-in if needed ("Imagine you're…", "Think about the last time you…").

        Choose single or multiple select, only use Likert if it actually fits.

        Max 10 answer options, all crystal clear and mutually exclusive.

        Always include an opt-out ("None of these," "Don't know / Prefer not to say").

        📊 SURVEY STRUCTURE:
        This runs in a nationally representative omnibus survey, n=1,000 UK adults, with quotas on:

        Gender

        Region

        Age

        So your question has to hold water when sliced and diced by those demos.

        🧠 OUTPUT FORMAT (WITH ATTITUDE):
        json
        Copy
        {
        "questionText": "string",
        "singleInput": boolean,
        "options": ["string", "string", ...](4 or fewer for single-choice, 9 or fewer for multi-choice),
        "AIExplanation": {
            "whyQuestionRocks": "Give me the snappy, no-fluff, slightly cheeky reason this question lands like a boss.",
            "whatInsightUnlocks": "Tell me how this insight arms marketers to smash it—call out the juicy demo cuts and how it shapes smart brand moves."
        }
        }

        input: "${inputText}"
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful market research assistant that always responds in valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" }, // This ensures JSON output
    });

    return new Response(response.choices[0].message.content, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate question" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
