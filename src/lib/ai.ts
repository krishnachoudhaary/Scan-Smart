import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function verifyIngredientsFromImage(base64Image: string, dbIngredients: string): Promise<{
  match: boolean;
  discrepancies: string[];
  hiddenIngredients: string[];
  explanation: string;
}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `Compare the ingredients list in this image with the following database entry: "${dbIngredients}". 
          Identify if there are any "Hidden Ingredients" (ingredients in the image but not in the database) or "Misinformation" (ingredients in the database but not in the image).
          Return the result in JSON format with the following structure:
          {
            "match": boolean,
            "discrepancies": string[],
            "hiddenIngredients": string[],
            "explanation": string
          }`
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('OCR Verification Error:', error);
    throw error;
  }
}

export async function checkUrlSafety(url: string): Promise<{
  isSafe: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  threatType: string[];
  explanation: string;
  recommendation: string;
}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this URL for potential scams, phishing, or misinformation: "${url}". 
      Consider the domain reputation, structure, and common scam patterns.
      Return the result in JSON format with the following structure:
      {
        "isSafe": boolean,
        "riskLevel": "low" | "medium" | "high",
        "threatType": string[],
        "explanation": string,
        "recommendation": string
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('URL Safety Check Error:', error);
    return {
      isSafe: true,
      riskLevel: 'low',
      threatType: [],
      explanation: "Unable to verify URL safety at this time.",
      recommendation: "Proceed with caution."
    };
  }
}
