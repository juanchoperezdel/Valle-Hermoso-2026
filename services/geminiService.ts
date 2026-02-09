import { GoogleGenAI, Type } from "@google/genai";
import { Item, Person } from "../types";

let aiInstance: any = null;

const getAI = () => {
  if (aiInstance) return aiInstance;

  const apiKey = import.meta.env.VITE_API_KEY || '';
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }

  try {
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (error) {
    console.error("Failed to initialize Gemini:", error);
    return null;
  }
};

export const parseNaturalLanguageItem = async (text: string, currentPeople: Person[]): Promise<{ name: string, totalQuantity: number, assignments: { personName: string, quantity: number }[] } | null> => {
  try {
    const ai = getAI();
    if (!ai) return null;

    const peopleNames = currentPeople.map(p => p.name).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Extrae los detalles del ítem de este texto: "${text}". 
      Personas disponibles para asignar: ${peopleNames}.
      Busca cantidades totales (ej: "x5", "5 cervezas") y asignaciones específicas (ej: "Juan trae 2").
      Si no se especifica cantidad, asume 1.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "El nombre principal del ítem" },
            totalQuantity: { type: Type.NUMBER, description: "Cantidad total necesaria. Por defecto 1." },
            assignments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  personName: { type: Type.STRING },
                  quantity: { type: Type.NUMBER }
                }
              },
              description: "Lista de asignaciones encontradas en el texto"
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error de Gemini:", error);
    return null;
  }
};

export const suggestMissingItems = async (currentItems: Item[]): Promise<string[]> => {
  try {
    const ai = getAI();
    if (!ai) return [];

    const itemList = currentItems.map(i => i.name).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Aquí hay una lista de cosas para un campamento: ${itemList}. 
      Sugiere 5 ítems importantes que probablemente falten. 
      Responde SOLO con un array de strings en español.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error de sugerencias Gemini:", error);
    return [];
  }
};