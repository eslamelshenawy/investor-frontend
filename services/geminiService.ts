import { GoogleGenAI } from "@google/genai";
import { Widget } from "../types";

// NOTE: In a real production app, this key should be handled via a proxy server to avoid exposure.
// For this demo, we assume process.env.API_KEY is available or injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWidgetData = async (widget: Widget): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key missing. Please configure the Gemini API Key.";
  }

  try {
    const model = 'gemini-3-pro-preview';
    
    // Prepare the prompt context
    const dataContext = JSON.stringify(widget.data);
    const prompt = `
      Act as a senior financial analyst for the "Investor Radar" platform.
      Analyze the following dataset for the widget titled "${widget.title}" (${widget.description}).
      
      Data: ${dataContext}
      
      Provide a concise, professional insight (max 100 words) in Arabic suitable for high-level investors. 
      Focus on the trend, anomaly, or key takeaway.
      Format the output as plain text.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 } // Enable thinking mode for deep reasoning
      }
    });

    return response.text || "لم يتم العثور على تحليل.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "حدث خطأ أثناء تحليل البيانات. يرجى المحاولة لاحقاً.";
  }
};