
export const GEMINI_TEXT_MODEL = 'gemini-3-pro-preview';
export const GEMINI_IMAGE_MODEL_FLASH = 'gemini-2.5-flash-image';
export const GEMINI_IMAGE_MODEL_PRO = 'gemini-3-pro-image-preview';
export const GEMINI_SEO_MODEL = 'gemini-3-flash-preview';

export const IMAGE_GENERATION_CONCURRENCY_LIMIT = 3;
export const IMAGE_GENERATION_WARNING = "Attention : la génération haute fidélité consomme des ressources.";
export const IMAGE_DOWNLOAD_FILENAME = "nanocreative-studio";

export const MAX_IMAGE_UPLOAD_SIZE_MB = 5;
export const MAX_IMAGE_DIMENSION_PX = 1024;
export const JPEG_COMPRESSION_QUALITY = 0.8;

export const API_KEY_MISSING_MESSAGE = "Clé API manquante.";

export const GRADIENT_PURPLE_PINK = 'bg-gradient-to-r from-[#9b59ff] to-[#ff3c8c]';
export const HOVER_GRADIENT_PURPLE_PINK = 'hover:from-[#8a2be2] hover:to-[#c84bff]';

export const BACKGROUND_OPTIONS = [
  { 
    id: 'coherent', 
    label: 'Cohérent Pro', 
    emoji: '🧠', 
    description: 'Analyse IA : réalisme extrême & contexte parfait', 
    prompt: 'automatically analyzed based on the product type. Create a logically perfect, hyper-realistic, high-end environment. Background must be "realistic to death", avoiding AI-cleanliness. Natural window light, organic shadows, real-world textures, professional lifestyle photography.' 
  },
  { 
    id: 'ultra_real', 
    label: 'Réaliste à Mort', 
    emoji: '🔥', 
    description: 'Style photo de rue, grain ciné, ultra-détaillé', 
    prompt: 'interacted with by a person in a gritty, high-end, realistic urban or home setting. 35mm lens, f/1.8, cinematic lighting, natural skin textures, authentic everyday environment, hyper-realistic rendering.' 
  },
  { 
    id: 'macro_details', 
    label: 'Macro Détails', 
    emoji: '🔍', 
    description: 'Gros plan extrême sur les matières & textures', 
    prompt: 'extreme macro close-up, focused on material textures (leather grain, fabric weave, polished metal). Sharp details, soft professional bokeh, high-end catalog macro lens style.' 
  },
  { id: 'white_bg', label: 'Blanc Pur', emoji: '⬜', description: 'Fond blanc immaculé (Catalogue)', prompt: 'on a solid, pure white studio background with soft professional shadows and no other objects' },
  { id: 'mix', label: 'Mix Aléatoire', emoji: '🎲', description: 'Diversité totale pour vos photos', prompt: 'a unique, high-end professional background for each shot, varying between nature, luxury, and studio' },
  { id: 'studio_noir', label: 'Studio Noir', emoji: '🌑', description: 'Élégant & Dramatique', prompt: 'in a professional dark studio with dramatic rim lighting and deep black background' },
  { id: 'bright', label: 'Lumineux', emoji: '☀️', description: 'Épuré & Minimaliste', prompt: 'in a bright, airy white studio with soft natural light and clean shadows' },
  { id: 'luxury_gold', label: 'Luxe & Or', emoji: '💎', description: 'Velours & Dorures', prompt: 'on a luxurious velvet surface with gold accents and elegant bokeh lighting' },
  { id: 'boho', label: 'Boho Chic', emoji: '🌿', description: 'Rotin & Naturel', prompt: 'in a bohemian setting with pampas grass, terracotta pots, and warm sunlight' },
  { id: 'industrial', label: 'Industriel', emoji: '🏗️', description: 'Brique & Métal', prompt: 'on a metal workbench against a weathered red brick wall in a trendy loft' },
  { id: 'tropical', label: 'Tropical', emoji: '🌴', description: 'Jungle & Frais', prompt: 'surrounded by lush monstera leaves and exotic flowers with dappled jungle sunlight' },
  { id: 'christmas', label: 'Noël', emoji: '🎄', description: 'Chaud & Festif', prompt: 'on a festive wooden table with warm fairy lights and pine branches' },
  { id: 'snow', label: 'Hiver', emoji: '❄️', description: 'Froid & Neige', prompt: 'resting on fresh powdery snow with soft blue winter lighting' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🌆', description: 'Néons & Futur', prompt: 'in a neon-drenched rainy city alley at night with glowing blue and pink advertisements' },
  { id: 'zen', label: 'Zen Japonais', emoji: '⛩️', description: 'Calme & Pur', prompt: 'on a smooth black stone in a minimalist Japanese garden with bamboo' },
  { id: 'marble', label: 'Marbre Blanc', emoji: '🏛️', description: 'Noble & Pur', prompt: 'on a polished Carrara marble floor with classical columns' }
];
