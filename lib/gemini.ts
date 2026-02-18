import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_AI_API_KEY;
export const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;
