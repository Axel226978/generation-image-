
import React, { useState, useEffect, useCallback, useRef } from 'react';
import TopNavBar from './components/TopNavBar';
import MainContent from './components/MainContent';
import RightPanel from './components/RightPanel';
import ApiKeyModal from './components/ApiKeyModal';
import { generateImage, testSpecificApiKey } from './services/geminiService';
import { 
    IMAGE_GENERATION_CONCURRENCY_LIMIT, 
    MAX_IMAGE_UPLOAD_SIZE_MB, 
    GEMINI_IMAGE_MODEL_FLASH 
} from './constants';
import { GeneratedImage, UploadedImage } from './types';
import { resizeImage } from './utils/imageUtils';

function App() {
  const [activeNav, setActiveNav] = useState('Products');
  const prevNavRef = useRef('Products');

  const [userApiKey, setUserApiKey] = useState<string>('');
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Source states for Products Tab
  const [promptsGeneratedByProductsTab, setPromptsGeneratedByProductsTab] = useState<string[]>([]);
  const [productsTabRefImages, setProductsTabRefImages] = useState<UploadedImage[]>([]);

  // Source states for Images Tab (The Studio)
  const [promptsForImagesTab, setPromptsForImagesTab] = useState<string[]>([]);
  const [imagesTabRefImages, setImagesTabRefImages] = useState<UploadedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imagesGeneratedCount, setImagesGeneratedCount] = useState(0);
  
  // SEO state
  const [ficheProduitImageBase64, setFicheProduitImageBase64] = useState<string | null>(null);
  const [ficheProduitImageMimeType, setFicheProduitImageMimeType] = useState<string | null>(null);

  // Effect to clear state of previous menu when switching
  useEffect(() => {
    const prevNav = prevNavRef.current;
    if (prevNav !== activeNav) {
      if (prevNav === 'Products') {
        setPromptsGeneratedByProductsTab([]);
        setProductsTabRefImages([]);
      } else if (prevNav === 'Images') {
        setPromptsForImagesTab([]);
        setImagesTabRefImages([]);
        setGeneratedImages([]);
        setIsGeneratingImages(false);
      } else if (prevNav === 'Product Listing') {
        setFicheProduitImageBase64(null);
        setFicheProduitImageMimeType(null);
      }
      prevNavRef.current = activeNav;
    }
  }, [activeNav]);

  const validateKey = async (key: string) => {
    if (!key) { setIsApiKeyValid(false); return; }
    setIsApiKeyValid(null); 
    try {
        const isValid = await testSpecificApiKey(key);
        setIsApiKeyValid(isValid);
    } catch (error) {
        setIsApiKeyValid(false);
    }
  };

  useEffect(() => {
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) { setUserApiKey(storedKey); validateKey(storedKey); }
    else { setIsApiKeyValid(false); }
  }, []);

  const handleSaveApiKey = (key: string) => {
    const trimmedKey = key.trim();
    setUserApiKey(trimmedKey);
    localStorage.setItem('geminiApiKey', trimmedKey);
    validateKey(trimmedKey);
    setIsApiKeyModalOpen(false);
  };

  const handleGenerateImages = useCallback(async (customPrompts?: string[], customRefImages?: UploadedImage[]) => {
    const activePrompts = customPrompts || promptsForImagesTab;
    const activeRefImages = customRefImages || imagesTabRefImages;
    
    if (activePrompts.length === 0 || !userApiKey || !isApiKeyValid) {
        return;
    }

    setIsGeneratingImages(true);
    const initial = activePrompts.map((p, pIdx) => ({
        id: `img-${pIdx}-${Date.now()}`, url: null, prompt: p, loading: true
    }));
    setGeneratedImages(initial);
    setImagesGeneratedCount(0);

    let currentIndex = 0;
    const execute = async () => {
        const batch = [];
        for (let i = 0; i < IMAGE_GENERATION_CONCURRENCY_LIMIT && currentIndex < initial.length; i++) {
            const taskIdx = currentIndex++;
            batch.push((async () => {
                try {
                    const url = await generateImage(userApiKey, initial[taskIdx].prompt, { inAndOutMode: true }, activeRefImages, GEMINI_IMAGE_MODEL_FLASH);
                    setGeneratedImages(prev => {
                        const next = [...prev];
                        next[taskIdx] = { ...next[taskIdx], url, loading: false };
                        return next;
                    });
                } catch (e: any) {
                    setGeneratedImages(prev => {
                        const next = [...prev];
                        next[taskIdx] = { ...next[taskIdx], loading: false, error: e.message };
                        return next;
                    });
                } finally {
                    setImagesGeneratedCount(c => c + 1);
                }
            })());
        }
        await Promise.allSettled(batch);
        if (currentIndex < initial.length) await execute();
    };
    await execute();
    setIsGeneratingImages(false);
  }, [promptsForImagesTab, imagesTabRefImages, userApiKey, isApiKeyValid]);

  const handleCopyPromptsToImagesTab = (prompts: string[]) => {
    const refCopy = [...productsTabRefImages];
    setPromptsForImagesTab(prompts);
    setImagesTabRefImages(refCopy);
    setActiveNav('Images');
    setTimeout(() => {
      handleGenerateImages(prompts, refCopy);
    }, 100);
  };

  const handleImageUpload = async (files: FileList | null, tab: string) => {
    if (!files || files.length === 0) return;
    const newImages: UploadedImage[] = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_IMAGE_UPLOAD_SIZE_MB * 1024 * 1024) continue;
        try {
            const base64Data = await resizeImage(file);
            newImages.push({
                id: `${Date.now()}-${i}`,
                data: base64Data,
                mimeType: 'image/jpeg'
            });
        } catch (e) { console.error(e); }
    }
    
    if (tab === 'Products') setProductsTabRefImages(prev => [...prev, ...newImages]);
    if (tab === 'Images') setImagesTabRefImages(prev => [...prev, ...newImages]);
    if (tab === 'Product Listing' && newImages.length > 0) {
        setFicheProduitImageBase64(newImages[0].data);
        setFicheProduitImageMimeType('image/jpeg');
    }
  };

  const handleRemoveImage = (id: string, tab: 'Products' | 'Images' | 'Product Listing') => {
    if (tab === 'Products') setProductsTabRefImages(prev => prev.filter(img => img.id !== id));
    if (tab === 'Images') setImagesTabRefImages(prev => prev.filter(img => img.id !== id));
    if (tab === 'Product Listing') {
      setFicheProduitImageBase64(null);
      setFicheProduitImageMimeType(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0f12] text-[#e0e0e0]">
      <TopNavBar activeNav={activeNav} setActiveNav={setActiveNav} isApiKeyValid={isApiKeyValid} onApiKeyClick={() => setIsApiKeyModalOpen(true)} />
      <ApiKeyModal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} onSave={handleSaveApiKey} currentKey={userApiKey} />
      <div className="flex flex-1 p-6 space-x-6 overflow-hidden">
        <MainContent 
          {...{ 
            activeNav, setActiveNav, userApiKey, isApiKeyValid, 
            generatedPrompts: promptsGeneratedByProductsTab, 
            setGeneratedPrompts: setPromptsGeneratedByProductsTab,
            imageGenerationPrompts: promptsForImagesTab.join('\n'),
            setImageGenerationPrompts: (val) => setPromptsForImagesTab(val.split('\n').filter(p => p.trim())),
            handleImageUpload, handleRemoveImage,
            promptsTabRefImages: productsTabRefImages, 
            imagesTabRefImages,
            ficheProduitImageBase64, ficheProduitImageMimeType,
            generatedImages,
            isGeneratingImages
          }}
        />
        <RightPanel 
          activeNav={activeNav}
          generatedPrompts={promptsGeneratedByProductsTab}
          onCopyPromptsToImages={handleCopyPromptsToImagesTab}
        />
      </div>
    </div>
  );
}

export default App;
