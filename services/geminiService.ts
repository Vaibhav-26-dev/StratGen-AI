import { GoogleGenAI, Type } from "@google/genai";
import { BusinessStrategy, UserInput, CompetitorAnalysis, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to robustly extract JSON from potentially chatty model output
const extractJSON = (text: string): any => {
  // 1. Attempt clean parse
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to extraction
  }

  // 2. Remove markdown code blocks
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();

  // 3. Find all candidate JSON objects
  // The model sometimes outputs multiple JSON objects (e.g. a draft followed by a final version, or concatenated objects)
  // We want to extract all of them and use the last valid one.
  const candidates: any[] = [];
  let startIndex = 0;

  while (startIndex < cleaned.length) {
    const firstBrace = cleaned.indexOf('{', startIndex);
    if (firstBrace === -1) break;

    let braceCount = 0;
    let inString = false;
    let isEscaped = false;
    let endIndex = -1;

    for (let i = firstBrace; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }

    if (endIndex !== -1) {
      const jsonCandidate = cleaned.substring(firstBrace, endIndex + 1);
      try {
        const parsed = JSON.parse(jsonCandidate);
        candidates.push(parsed);
      } catch (e) {
        // If an individual block fails to parse, ignore it and continue searching
        // potentially skipping this block or just moving forward
      }
      // Move past this object to search for the next one
      startIndex = endIndex + 1;
    } else {
      // No closing brace found for the current open brace
      break;
    }
  }

  if (candidates.length > 0) {
    // Return the last valid JSON object found (often the most refined version)
    return candidates[candidates.length - 1];
  }

  // 4. Fallback: Greedy extraction (original logic)
  // If robust extraction failed to find ANY valid objects, try the greedy approach
  // which takes everything from the first { to the last }.
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const greedyCandidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(greedyCandidate);
    } catch (innerE) {
      // Both approaches failed
    }
  }

  throw new Error("Failed to extract and parse JSON");
};

const generateCoreStrategy = async (input: UserInput): Promise<Omit<BusinessStrategy, 'competitorAnalysis'>> => {
  const prompt = `
    Act as a world-class business consultant. Generate a comprehensive business strategy for a client with the following details:
    - Industry/Sector: ${input.industry}
    - Business Description: ${input.description || "N/A"}
    - Customer Geography: ${input.locationType}
    - Market Location/Reach: ${input.marketReach}
    - Budget: ${input.budget}
    - Target Customers (Type/Demographics): ${input.targetCustomers}

    Provide the output in strict JSON format.
    Ensure the "marketingPlan.channels" includes an "estimatedBudgetPercentage" (number between 0-100) that sums to roughly 100.
    Ensure "risks" includes a "probability" score from 1 to 10 (10 being highest probability).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: "You are an expert business strategist. You analyze markets, budgets, and demographics to create actionable, high-quality business plans.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING, description: "A brief 2-3 sentence summary of the strategy." },
          businessModel: {
            type: Type.OBJECT,
            properties: {
              valueProposition: { type: Type.STRING },
              revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
              costStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyPartners: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["valueProposition", "revenueStreams", "costStructure", "keyPartners"]
          },
          marketingPlan: {
            type: Type.OBJECT,
            properties: {
              strategyOverview: { type: Type.STRING },
              targetAudienceAnalysis: { type: Type.STRING },
              channels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    estimatedBudgetPercentage: { type: Type.NUMBER, description: "Percentage of budget allocated (0-100)" }
                  }
                }
              }
            },
            required: ["strategyOverview", "targetAudienceAnalysis", "channels"]
          },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"]
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phaseName: { type: Type.STRING },
                duration: { type: Type.STRING },
                focusArea: { type: Type.STRING },
                milestones: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                riskName: { type: Type.STRING },
                impactLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                probability: { type: Type.NUMBER, description: "Score 1-10" },
                mitigationStrategy: { type: Type.STRING }
              }
            }
          }
        },
        required: ["executiveSummary", "businessModel", "marketingPlan", "swot", "roadmap", "risks"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No core strategy generated");
  
  try {
    return extractJSON(text) as Omit<BusinessStrategy, 'competitorAnalysis'>;
  } catch (e) {
    console.error("Failed to parse core strategy JSON", text);
    throw new Error("Failed to parse strategy data.");
  }
};

const generateCompetitorAnalysis = async (input: UserInput): Promise<CompetitorAnalysis> => {
  const prompt = `
    Act as a world-class business consultant.
    Analyze the following business idea and generate a real-world competitor analysis using Google Search.
    
    Business Idea Context:
    - Industry/Sector: ${input.industry}
    - Description: ${input.description || "N/A"}
    - Geography: ${input.locationType}
    - Market Location: ${input.marketReach}
    - Budget: ${input.budget}
    - Target Customers: ${input.targetCustomers}

    TASKS:
    1. Identify Top 3 Companies actively working in this space (relevant to the location/geography if possible).
    2. Perform a Deep-Dive Analysis of the Top 1 Competitor.

    Return the output as a VALID JSON object with this exact structure:
    {
      "topCompetitors": [
        { "name": "...", "description": "..." }
      ],
      "deepDive": {
        "companyName": "...",
        "strategy": "...",
        "revenueModel": "...",
        "strengths": ["..."],
        "weaknesses": ["..."],
        "opportunities": ["..."]
      }
    }
    
    IMPORTANT: Return ONLY the JSON string. Do not use Markdown formatting like \`\`\`json.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text;
  if (!text) {
    return {
      topCompetitors: [],
      deepDive: { companyName: "Not Found", strategy: "N/A", revenueModel: "N/A", strengths: [], weaknesses: [], opportunities: [] },
      sources: []
    };
  }

  let data: any = {};
  try {
    data = extractJSON(text);
  } catch (e) {
    console.error("Failed to parse competitor JSON", text);
    data = {};
  }

  const safeData: CompetitorAnalysis = {
    topCompetitors: Array.isArray(data?.topCompetitors) ? data.topCompetitors : [],
    deepDive: data?.deepDive || {
        companyName: "Analysis Unavailable",
        strategy: "N/A",
        revenueModel: "N/A",
        strengths: [],
        weaknesses: [],
        opportunities: []
    },
    sources: []
  };

  const sources: { title: string; url: string }[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title || "Web Source", url: chunk.web.uri });
      }
    });
  }

  safeData.sources = sources;
  return safeData;
};

export const generateStrategy = async (input: UserInput): Promise<BusinessStrategy> => {
  const [core, competitors] = await Promise.all([
    generateCoreStrategy(input),
    generateCompetitorAnalysis(input)
  ]);
  
  return {
    ...core,
    competitorAnalysis: competitors
  };
};

export const chatWithStrategy = async (
  history: ChatMessage[],
  newMessage: string,
  context: BusinessStrategy,
  useThinking: boolean,
  attachedImage?: string
): Promise<{ text: string, image?: string }> => {
  
  const systemInstruction = `
    You are StratGen AI Assistant — an intelligent business strategy partner.
    
    Your goal is to help the user understand, refine, and execute their business strategy based on the data provided below.
    
    CURRENT BUSINESS STRATEGY CONTEXT:
    ${JSON.stringify(context, null, 2)}
    
    Your Rules:
    • Answer questions specifically about the strategy above.
    • Be practical, clear, and action-oriented.
    • If I ask about my location or nearby businesses, use Google Maps.
    • If I upload an image, analyze it or edit it as requested.
  `;

  // 1. Handle Image Inputs (Editing / Analysis)
  if (attachedImage) {
    const cleanImage = attachedImage.split(',')[1];
    const lowerMsg = newMessage.toLowerCase();
    
    // Heuristic: Check if user wants to EDIT/GENERATE image or ANALYZE it
    const isEditing = ["edit", "add", "remove", "filter", "generate", "create", "change", "replace", "make"].some(k => lowerMsg.includes(k));

    if (isEditing) {
      // Use Gemini 2.5 Flash Image for editing ("Nano Banana")
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanImage } },
            { text: newMessage }
          ]
        }
      });

      let responseText = "";
      let responseImage = undefined;

      // Iterate parts to find text and image
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            responseImage = `data:image/png;base64,${part.inlineData.data}`;
          } else if (part.text) {
            responseText += part.text;
          }
        }
      }
      
      return { text: responseText || "Here is your edited image.", image: responseImage };

    } else {
      // Use Gemini 3 Pro Preview for Analysis
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanImage } },
            { text: newMessage }
          ]
        },
        config: { systemInstruction }
      });

      return { text: response.text || "I analyzed the image." };
    }
  }
  
  // Standard Text Chat Logic (History + Maps/Thinking)
  const contents = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }] 
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  const config: any = {
    systemInstruction: systemInstruction,
  };

  let modelName = 'gemini-2.5-flash';

  if (useThinking) {
    modelName = 'gemini-3-pro-preview';
    config.thinkingConfig = { thinkingBudget: 32768 };
  } else {
    modelName = 'gemini-2.5-flash';
    config.tools = [{ googleMaps: {} }];
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config
    });

    let finalText = response.text || "";

    // Extract Maps Grounding URLs
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      const mapLinks = chunks
        .filter((c: any) => c.maps?.uri)
        .map((c: any) => `\n- [${c.maps.title || "Map Link"}](${c.maps.uri})`)
        .join('');
      
      if (mapLinks) {
        finalText += "\n\n**Related Locations:**" + mapLinks;
      }
    }

    return { text: finalText };

  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "I encountered an error while processing your request. Please try again." };
  }
};