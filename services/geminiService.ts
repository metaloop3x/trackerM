import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Category, ScanResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const scanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    merchant: { type: Type.STRING, description: "Name of the merchant or store" },
    date: { type: Type.STRING, description: "Date of transaction in YYYY-MM-DD format. If not found, use today." },
    total: { type: Type.NUMBER, description: "Total amount of the bill" },
    category: { 
      type: Type.STRING, 
      enum: Object.values(Category),
      description: "Best fitting category based on the user's specific art/life taxonomy." 
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Generate 1-3 relevant hashtags (without the # symbol) based on items. E.g., 'Adobe' -> 'CreativeTools', 'Netflix' -> 'Entertainment', 'VPN' -> 'Comms'."
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.NUMBER },
          quantity: { type: Type.NUMBER }
        }
      }
    }
  },
  required: ["merchant", "total", "category"]
};

export const analyzeReceipt = async (base64Image: string, mimeType: string): Promise<ScanResult> => {
  try {
    const model = 'gemini-2.5-flash'; 
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `Analyze this receipt. Extract merchant, date, total. 
            Categorize it precisely into one of the provided categories. 
            Also generate useful hashtags (e.g., 'Cloud', 'ArtSupplies', 'Coffee') based on the content.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: scanSchema,
        temperature: 0.1 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as ScanResult;
    
    // Fallback if AI misses date
    if (!result.date) {
        result.date = new Date().toISOString().split('T')[0];
    }
    
    // Ensure category matches our Enum, fallback to Other Expense if not found
    if (!Object.values(Category).includes(result.category)) {
        result.category = Category.OTHER_EXPENSE;
    }

    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};