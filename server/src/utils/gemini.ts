import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
// const GeminiClient = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const GeminiClient = new GoogleGenerativeAI("AIzaSyBZyPV8G6v1MiCsvjces1y5FZwgs49hlVk");

export async function getGeminiGeneratedResponse(prompt:string) {
        // const model = GeminiClient.getGenerativeModel({ model: process.env.GEMINI_MODEL_NAME! });
        const model = GeminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(response.text())
        return response.text()
}
