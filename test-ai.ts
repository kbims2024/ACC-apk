import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
console.log(process.env.GEMINI_API_KEY ? "Key exists" : "No key");
try {
  const resp = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Hello' });
  console.log(resp.text);
} catch (e) {
  console.error(e);
}
