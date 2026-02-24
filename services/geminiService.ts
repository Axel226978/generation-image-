
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL_PRO, GEMINI_IMAGE_MODEL_FLASH, GEMINI_SEO_MODEL, API_KEY_MISSING_MESSAGE } from '../constants';
import { SeoResult, UploadedImage } from '../types';

const getGeminiClient = (apiKey: string) => {
  if (!apiKey) throw new Error(API_KEY_MISSING_MESSAGE);
  return new GoogleGenAI({ apiKey });
};

export async function testSpecificApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) throw new Error("Clé vide.");
  try {
    const ai = getGeminiClient(apiKey);
    await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: [{ parts: [{ text: 'ping' }] }],
      config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (error: any) {
    throw new Error(`Erreur validation API`);
  }
}

export async function generatePrompts(
  apiKey: string,
  productDescription: string | null = null,
  backgroundContext: string = "",
  referenceImages: UploadedImage[] = [],
  chatInput: string = "",
  inAndOutMode: boolean = false,
  numPrompts: number = 12
): Promise<string[]> {
  const ai = getGeminiClient(apiKey);
  const parts: Part[] = [];
  
  let backgroundInstruction = backgroundContext;
  if (backgroundContext.includes("automatically analyzed")) {
    backgroundInstruction = `ANALYZE PRODUCT FIRST: Detect product category and materials. 
CREATE CONTEXT: Design an environment that is "realistic to death" (très réaliste à mort). 
Atmospheric, logical, high-end lifestyle settings only. Use descriptors like "natural sunlight", "soft window bokeh", "organic high-end home", or "authentic street texture". 
Avoid sterile AI backgrounds. Ensure the product feels integrated into a real space. Cinematic hyper-realism.`;
  }

  let textPrompt = `You are a world-class professional product photographer. Generate exactly ${numPrompts} unique image prompts for the product in the reference.

**CORE RULES:**
1. **PRODUCT IDENTITY**: The subject MUST remain 100% identical. Every logo, texture, and shape.
2. **REALISM**: Backgrounds must be ultra-realistic, cinematic, and professional. Use "realistic to death" style.
3. **VARIETY**: Use different angles (45°, flatlay, macro, lifestyle, eye-level).
4. **CONTEXT**: ${backgroundInstruction}.
5. **FORMAT**: Just ${numPrompts} lines of plain text. NO BOLD. NO ASTERISKS.`;

  if (inAndOutMode) {
    textPrompt += `\n\n**IN-AND-OUT PROTOCOL**: Preserve pixel-perfect branding and silhouette.`;
  }

  if (chatInput.trim()) {
    textPrompt += `\n\n**USER CUSTOMIZATION**: ${chatInput}.`;
  }

  if (referenceImages.length > 0) {
    referenceImages.forEach(img => {
      parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
    });
  }
  
  parts.push({ text: textPrompt + `\n\nProduct Name/Context: ${productDescription || 'Preserve reference identity'}` });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: { parts: parts },
      config: { 
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });

    const text = (response.text || "").replace(/\*/g, '');
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 10)
      .slice(0, numPrompts);
  } catch (error) {
    throw new Error("Erreur lors de la génération des scénarios.");
  }
}

export async function generateImage(
  apiKey: string,
  prompt: string,
  imageConfig?: { aspectRatio?: string, inAndOutMode?: boolean },
  referenceImages: UploadedImage[] = [],
  modelName: string = GEMINI_IMAGE_MODEL_FLASH
): Promise<string> {
  const ai = getGeminiClient(apiKey);
  const parts: Part[] = [];
  
  let identityInstruction = `SUBJECT: Keep the EXACT object from the reference. Branding and shape must be 100% accurate. `;
  if (imageConfig?.inAndOutMode) {
    identityInstruction = `**IN-AND-OUT MODE**: Ensure zero drift on the product. SCENE: `;
  } else {
    identityInstruction += `SCENE: `;
  }

  const ultraRealisticInstructions = `
ULTRA-REALISM REQUIREMENTS (MANDATORY):
- PHOTOREALISTIC quality, indistinguishable from real photography
- Natural lighting ONLY: soft window light, golden hour sunlight, diffused daylight, warm indoor lighting
- Real-world environment: authentic textures (wood grain, fabric weave, stone patterns, natural surfaces)
- Organic imperfections: subtle shadows, natural color variations, realistic depth of field
- Professional photography techniques: bokeh background blur, natural reflections, ambient occlusion
- NO artificial/sterile backgrounds, NO perfect gradients, NO CGI look
- Background must be a REAL PLACE: cozy home interior, rustic wooden table, natural outdoor setting, authentic lifestyle scene
- Atmospheric depth: foreground sharp, background naturally blurred
- Color grading: warm, natural tones, film-like quality
- Lighting physics: realistic highlights, soft shadows, natural light falloff
- Texture detail: visible material properties, tactile surfaces
- 8K resolution, shot on professional camera (Canon EOS R5, Sony A7R IV quality)
- AVOID: plastic look, overly saturated colors, artificial shine, perfect symmetry, digital artifacts`;

  if (referenceImages.length > 0) {
    parts.push({ text: (identityInstruction + prompt + ". " + ultraRealisticInstructions).replace(/\*/g, '') });
    referenceImages.forEach(img => {
      parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
    });
  } else {
    parts.push({ text: (prompt + ". " + ultraRealisticInstructions).replace(/\*/g, '') });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: { imageConfig: { aspectRatio: imageConfig?.aspectRatio || "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Échec du rendu image.");
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  } catch (error: any) {
    throw new Error(`Erreur Image Studio : ${error.message}`);
  }
}

export async function generateSeoContent(apiKey: string, imageData: string, mimeType: string, extraDetails?: string): Promise<SeoResult> {
  const ai = getGeminiClient(apiKey);
  const textPrompt = `You are an ELITE Etsy SEO Expert with 10+ years of experience and proven track record of getting listings to PAGE 1. Your mission: Create the ABSOLUTE BEST OPTIMIZED listing to DOMINATE Etsy search rankings.

**CRITICAL REQUIREMENTS:**

1. **5 EXCEPTIONAL SEO TITLES** (titleOptions array):
   - Generate 5 DIFFERENT optimized titles (max 140 chars each)
   - MANDATORY: Search Etsy RIGHT NOW for this product type and analyze TOP 10 best-sellers
   - Copy the EXACT keyword patterns used by best-sellers (front-load important keywords)
   - Use HIGH-VOLUME Etsy-specific keywords (not just generic terms)
   - Include power words proven on Etsy: "Handmade", "Unique", "Gift", "Custom", "Personalized", "Vintage Style"
   - Add occasion keywords: "Birthday", "Wedding", "Christmas", "Mother's Day" (if relevant)
   - If user mentions variants, integrate strategically: "Available in 3 Colors" or "Multiple Sizes"
   - Test different keyword orders (Etsy algorithm weighs first words heavily)

2. **ETSY-SPECIFIC ULTRA-DEEP RESEARCH** (MANDATORY - USE GOOGLE SEARCH):
   - Search "site:etsy.com [product type] best seller" to find TOP performers
   - Analyze their titles, tags, and description structure
   - Search "site:etsy.com [product type]" and note the first 20 results' keywords
   - Check Amazon/AliExpress ONLY for technical specs (materials, dimensions, weight)
   - Identify seasonal trends and current Etsy trending searches
   - Find long-tail keywords with lower competition but good conversion
   - Analyze what makes listings rank #1 on Etsy (not other platforms)

3. **USER DETAILS INTEGRATION** (ABSOLUTE PRIORITY):
   - The user has provided specific details in extraDetails
   - MUST incorporate EVERY detail they mentioned (colors, materials, story, dimensions)
   - If they say "Available in Red, Blue, Green" → mention ALL 3 colors prominently
   - Their text is GOLD - use it extensively in description
   - User details override generic assumptions

4. **PREMIUM DESCRIPTION STRUCTURE** (AVEC EMOJIS POUR HUMANISER):
   - Opening Hook: Emotional, benefit-driven (2-3 sentences) ✨ Add relevant emojis
   - Storytelling Paragraph: Brand story, craftsmanship, inspiration 💫 Use emojis naturally
   - Technical Details Section: 
     * 📏 Materials (from research + user details)
     * 📐 Dimensions/Sizes (from research + user details)
     * 🎨 Available Variants (from user details)
     * 🧼 Care Instructions
   - 🎁 Use Case Scenarios: Perfect for X, Y, Z occasions
   - ❓ FAQ Section (FLUID format - NO "Q:" or "A:"):
     * 5-7 common questions with natural conversational answers
     * Address shipping, customization, care, sizing
   
   **EMOJI USAGE RULES**:
   - Use emojis STRATEGICALLY throughout the description (not too many, not too few)
   - Place emojis at the START of sections/bullet points for visual breaks
   - Use relevant emojis: ✨💫🎁🌟💝🎨🏠🌿💚❤️🔥👌✅📦🚚💌🎀🌸
   - Make the text feel WARM, HUMAN, and ENGAGING
   - Emojis should enhance readability and add personality

5. **13 ULTRA-OPTIMIZED ETSY TAGS** (CRITICAL FOR RANKING):
   - MANDATORY: Search "site:etsy.com [product]" and extract tags from TOP 5 listings
   - Use Etsy's autocomplete suggestions (search for product and see what Etsy suggests)
   - Mix strategy:
     * 3-4 broad high-volume keywords (e.g., "handmade mug", "ceramic cup")
     * 5-6 medium-tail keywords (e.g., "nordic style mug", "minimalist ceramic")
     * 3-4 long-tail low-competition (e.g., "scandinavian coffee cup gift")
   - Include seasonal/occasion tags ONLY if highly relevant
   - Use EXACT phrases buyers type in Etsy search (not marketing language)
   - Avoid: generic words, trademarked terms, irrelevant tags
   - Prioritize: buyer intent keywords (what they're looking for, not what it is)
   
   **ETSY ALGORITHM OPTIMIZATION**:
   - First 3 tags are MOST important (Etsy weighs them heavily)
   - Tags should match words in your title (Etsy rewards consistency)
   - Use all 13 tags (never waste slots)
   - Multi-word phrases work better than single words
   - Think like a buyer: "gift for mom" not just "gift"

6. **STRICT JSON FORMAT** (CRITICAL - MUST BE VALID JSON):
{
  "title": "Best title from titleOptions (your top recommendation)",
  "titleOptions": ["title1", "title2", "title3", "title4", "title5"],
  "description": "Full optimized description WITH emojis inside the text content",
  "tags": "tag1, tag2, tag3, ... (exactly 13)",
  "category": "Etsy category"
}

**CRITICAL JSON RULES**:
- Emojis go INSIDE the string values (description content), NOT in JSON keys
- Properly escape all quotes and special characters
- Ensure all strings are properly closed
- No trailing commas
- Valid JSON structure only

**ETSY ALGORITHM SECRETS TO APPLY**:
- Etsy prioritizes: Relevancy > Listing Quality > Customer & Market Experience > Recency
- Front-load titles with EXACT search terms buyers use
- Repeat important keywords in title, tags, AND description (but naturally)
- Longer descriptions rank better (aim for 1000+ characters)
- Include materials, dimensions, and use cases (Etsy loves specificity)
- Natural language in FAQ helps with long-tail searches
- Seasonal keywords boost visibility during relevant periods

**FINAL OPTIMIZATION GOAL**: 
This listing MUST be optimized to appear in TOP 10 Etsy search results for its main keywords. 
Use EVERY Etsy-specific SEO technique. Analyze real Etsy best-sellers and replicate their winning patterns.
This is not generic SEO - this is ETSY-SPECIFIC optimization for maximum visibility and sales.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_SEO_MODEL,
      contents: { 
        parts: [
          { inlineData: { data: imageData, mimeType } }, 
          { text: textPrompt + `\n\n**USER PROVIDED DETAILS (MUST USE EXTENSIVELY):**\n${extraDetails || 'No specific details provided - analyze image deeply'}` }
        ] 
      },
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 12000 }
      },
    });

    let result;
    try {
      result = JSON.parse(response.text || "{}");
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw response:", response.text);
      throw new Error("Erreur de format de réponse. Veuillez réessayer.");
    }

    const clean = (s: string) => s.replace(/\*/g, '');
    if (result.title) result.title = clean(result.title);
    if (result.titleOptions && Array.isArray(result.titleOptions)) {
      result.titleOptions = result.titleOptions.map((t: string) => clean(t));
    }
    if (result.description) result.description = clean(result.description);
    return result;
  } catch (error) {
    console.error("SEO Error:", error);
    if (error instanceof Error) {
      throw new Error(`Erreur de génération SEO: ${error.message}`);
    }
    throw new Error("Erreur de génération SEO.");
  }
}
