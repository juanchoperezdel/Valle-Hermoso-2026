import { GoogleGenAI, Type } from "@google/genai";
import { Item, Person } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const parseNaturalLanguageItem = async (text: string, currentPeople: Person[]): Promise<{ name: string, totalQuantity: number, assignments: { personName: string, quantity: number }[] } | null> => {
  try {
    const peopleNames = currentPeople.map(p => p.name).join(', ');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
    const itemList = currentItems.map(i => i.name).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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