import type { Request, Response } from "express";
import { Router } from "express";
import axios from "axios";

const router: Router = Router();

const MODELS = [
  "openrouter/free",                   
  "meta-llama/llama-4-scout:free",      
  "meta-llama/llama-4-maverick:free",  
  "qwen/qwen3-coder:free",              
  "deepseek/deepseek-r1:free",          
];

const SYSTEM_PROMPT = `You are a diagram generation assistant embedded in a collaborative whiteboard app.

Always respond with ONLY this JSON shape, nothing else — no markdown, no explanation, no code blocks:

{
  "message": "short friendly message to show in chat",
  "elements": []
}

If the user asks to draw or generate a diagram:
- "message": brief description of what you drew
- "elements": array of canvas elements

If the user asks a general question or chats:
- "message": your reply
- "elements": [] (empty array)

Canvas element types for "elements" array:

Rectangle:
{  "type": "Rectangle", "Startx": number, "Starty": number, "endX": number, "endY": number, "color": "#ffffff", "strokWidth": 2, "strokColor": "#7c78e8" }

Arrow or Line:
{ "type": "Arrow" | "Line", "Startx": number, "Starty": number, "endX": number, "endY": number, "color": "#7c78e8", "strokWidth": 2 }

Ellipse:
{ "type": "Ellipse", "centerX": number, "centerY": number, "radius": number, "color": "#ffffff", "strokWidth": 2, "strokColor": "#7c78e8" }

Text:
{  "type": "text", "x": number, "y": number, "text": "string", "color": "#ffffff", "fontSize": 16 }

Rules:
- Use 800x600 coordinate space
- Unique ids: rect_1, arrow_2, text_3 etc
- ONLY return the JSON object, nothing else` 

router.post("/ai-diagram", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Prompt required" });

  let message = "";

  for (const model of MODELS) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { model, messages: [
         { role: "system", content: SYSTEM_PROMPT },
         { role: "user", content: prompt }
      ] },
      { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` } }
    );
    message = response.data.choices[0].message.content;
    break;
  } catch (err: any) {
    console.log(`${model} failed:`, err.response?.status, err.response?.data); // ← add this
    continue;
  }
}
  if (!message) return res.status(429).json({ message: "All models rate limited, try again later." });
  return res.status(200).json({ message });
});
export default router;