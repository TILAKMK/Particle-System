
import { GoogleGenAI, Type } from "@google/genai";
import { ParticleConfig, BehaviorType } from "../types";

export const generatePreset = async (prompt: string): Promise<Partial<ParticleConfig>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a particle system configuration for: "${prompt}". 
    Return a configuration that visually matches this description. Include gravity and wind forces.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          count: { type: Type.NUMBER, description: "Range 50-500" },
          sizeMin: { type: Type.NUMBER, description: "Range 0.1-5" },
          sizeMax: { type: Type.NUMBER, description: "Range 5-20" },
          speed: { type: Type.NUMBER, description: "Range 0.1-10" },
          gravity: { type: Type.NUMBER, description: "Range -0.5 to 0.5" },
          wind: { type: Type.NUMBER, description: "Range -0.2 to 0.2" },
          friction: { type: Type.NUMBER, description: "Range 0.9-0.99" },
          life: { type: Type.NUMBER, description: "Range 50-500" },
          colorRange: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Array of 3-5 hex colors"
          },
          behavior: { 
            type: Type.STRING, 
            description: "Must be one of: fountain, vortex, explosion, chaos, orbit" 
          },
          blur: { type: Type.NUMBER, description: "Range 0-10" },
          glow: { type: Type.BOOLEAN }
        },
        required: ["name", "count", "colorRange", "behavior"]
      }
    }
  });

  try {
    const config = JSON.parse(response.text);
    return config;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Invalid AI response");
  }
};
