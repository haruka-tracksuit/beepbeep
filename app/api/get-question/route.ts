import { GoogleGenerativeAI } from "@google/generative-ai";

export const POST = async (req: Request) => {
  try {
    // receive data
    const { inputText } = await req.json();

    // api checks
    const googleKey = process.env.GOOGLE_AI_KEY;

    if (!googleKey) {
      throw new Error("Google API key is missing");
    }

    const genAI = new GoogleGenerativeAI(googleKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      I have this question "${inputText}". This is to be asked in a market research survey and is to be an either single-choice or multiple-choice answer. Please reword the question (only if you deem it necessary), and return ONLY a JSON object with the shape of questionText as string, singleInput as a boolean, and the options (possible answers) as an array of strings,
    `;

    const result = await model.generateContent(prompt);

    return new Response(JSON.stringify(result.response.text()), {
      status: 200,
    });
  } catch (error) {
    return new Response(`Failed to fetch response ${error}`, {
      status: 500,
    });
  }
};
