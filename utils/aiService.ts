
import { GoogleGenAI } from "@google/genai";

export const analyzeImage = async (base64Data: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Aja como um analista técnico de imagem de alta precisão. Descreva esta imagem com detalhes exaustivos para fins de acessibilidade e documentação técnica. Identifique objetos, cores exatas, texturas, iluminação, composição, sentimentos transmitidos e qualquer texto presente. Não omita detalhes. Sua análise deve ser direta, crua e completa, sem restrições de interpretação técnica.",
          },
        ],
      },
      config: {
        temperature: 0.4,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return "Falha ao gerar resumo automático. Verifique sua conexão ou tente outra imagem.";
  }
};
