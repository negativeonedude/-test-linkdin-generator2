
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { UserProfileData, ChatMessage } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfileSection = async (
  userData: UserProfileData,
  sectionType: 'headline' | 'about' | 'experience' | 'strategy'
): Promise<string[]> => {
  const ai = getClient();
  const modelId = 'gemini-2.5-flash';

  const baseContext = `
    Context: The user is ${userData.fullName}, a business owner of ${userData.businessName} in the ${userData.industry} industry.
    Target Audience: ${userData.targetAudience}.
    Unique Value Proposition: ${userData.uniqueValueProposition}.
    Tone: ${userData.tone}.
    Achievements: ${userData.keyAchievements}.
  `;

  try {
    // Specific handling for headlines to return JSON array
    if (sectionType === 'headline') {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: `
          ${baseContext}
          Task: Write 3 distinct, high-impact LinkedIn Headlines (under 220 chars).
          Guidelines: Focus on outcome, include SEO keywords.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      
      // Parse standard JSON array response
      const json = JSON.parse(response.text || "[]");
      return Array.isArray(json) ? json : [response.text || ""];
    }

    // Text based generation for other sections
    let prompt = "";
    switch (sectionType) {
      case 'about':
        prompt = `
          ${baseContext}
          Task: Write a compelling "About" section for LinkedIn (approx 300 words).
          Guidelines:
          - Hook the reader immediately.
          - Personal Story Context: "${userData.personalStory}".
          - Use specific achievements: "${userData.keyAchievements}".
          - Tone: ${userData.tone}.
          - End with a CTA.
          Return only the text of the bio.
        `;
        break;
      case 'experience':
        prompt = `
          ${baseContext}
          Task: Write the description for the current role at ${userData.businessName}.
          Guidelines:
          - Focus on impact and results.
          - Use bullet points.
          Return only the text of the experience description.
        `;
        break;
      case 'strategy':
        prompt = `
          ${baseContext}
          Task: Provide a strategic checklist for profile setup (Banner, Featured Section, Creator Mode settings).
          Return only the checklist text.
        `;
        break;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { temperature: 0.7 }
    });

    return [response.text || "Error generating content."];

  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["Failed to generate content. Please try again."];
  }
};

export const generateMasterSystemInstruction = (
  userData: UserProfileData,
  headline: string,
  about: string,
  experience: string
): string => {
  return `
    You are the personalized LinkedIn Ghostwriter and AI Strategist for ${userData.fullName}.
    
    CORE IDENTITY & CONTEXT:
    - Business: ${userData.businessName} (${userData.industry})
    - Target Audience: ${userData.targetAudience}
    - Unique Value Proposition: ${userData.uniqueValueProposition}
    - Tone: ${userData.tone}
    
    YOUR APPROVED PROFILE DATA (Use this as ground truth for style and history):
    - Headline: "${headline}"
    - About Section: "${about}"
    - Experience/Role: "${experience}"

    YOUR MISSION:
    1. Help ${userData.fullName} write high-engagement LinkedIn posts that align with the strategy above.
    2. Provide advice on engagement, networking, and profile optimization based on the approved strategy.
    3. When writing posts, ALWAYS use the "${userData.tone}" tone. 
    4. Format posts with clean line breaks, hooks, and clear CTAs.
    
    If the user asks for a post, ask for the topic, then generate it using the 4-step method: Hook, Meat, Takeaway, CTA.
  `;
};

export const analyzeScreenshot = async (base64Image: string, userQuery: string): Promise<string> => {
  const ai = getClient();
  const modelId = 'gemini-2.5-flash-image'; // Use flash image for vision tasks

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image
            }
          },
          {
            text: `You are a LinkedIn technical support expert. 
            User Query: ${userQuery || "I am stuck here. What should I do?"}
            Analyze the screenshot. Provide step-by-step fix.`
          }
        ]
      }
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "Failed to analyze the screenshot.";
  }
};

export const createContentStrategistChat = (
  systemInstruction: string, 
  history: ChatMessage[] = []
): Chat => {
  const ai = getClient();
  
  // Convert simple ChatMessage to SDK format
  const sdkHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
    history: sdkHistory
  });
};
