
import React, { useState, useEffect } from 'react';
import { 
  GRADIENT_PURPLE_PINK, 
  HOVER_GRADIENT_PURPLE_PINK, 
  BACKGROUND_OPTIONS 
} from './constants';
import { generatePrompts, generateSeoContent } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import { GeneratedImage, UploadedImage, SeoResult } from './types';
import { downloadImage } from './utils/imageUtils';
import Modal from './components/Modal';

interface MainContentProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isApiKeyValid: boolean | null;
  userApiKey: string;
  imageGenerationPrompts: string;
  setImageGenerationPrompts: (p: string) => void;
  generatedPrompts: string[];
  setGeneratedPrompts: (p: string[]) => void;
  handleImageUpload: (files: FileList | null, tab: string) => void;
  handleRemoveImage: (id: string, tab: 'Products' | 'Images' | 'Product Listing') => void;
  promptsTabRefImages: UploadedImage[];
  imagesTabRefImages: UploadedImage[];
  ficheProduitImageBase64: string | null;
  ficheProduitImageMimeType: string | null;
  generatedImages: GeneratedImage[];
  isGeneratingImages: boolean;
}

const MainContent: React.FC<MainContentProps> = (props) => {
  const [productName, setProductName] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0].id);
  const [numPrompts, setNumPrompts] = useState(12);
  const [inAndOutMode, setInAndOutMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [seoResult, setSeoResult] = useState<SeoResult | null>(null);
  
  // States pour les détails SEO étendus
  const [seoVariations, setSeoVariations] = useState('');
  const [seoMaterials, setSeoMaterials] = useState('');
  const [seoStoryDetails, setSeoStoryDetails] = useState('');
  const [ficheProduitDetails, setFicheProduitDetails] = useState('');

  const [editableTitle, setEditableTitle] = useState('');
  const [editableDescription, setEditableDescription] = useState('');
  const [editableTags, setEditableTags] = useState('');
  
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (props.activeNav !== 'Product Listing') {
      setSeoResult(null);
      setEditableTitle('');
      setEditableDescription('');
      setEditableTags('');
      setSeoVariations('');
      setSeoMaterials('');
      setSeoStoryDetails('');
      setFicheProduitDetails('');
    }
  }, [props.activeNav]);

  useEffect(() => {
    if (seoResult) {
      setEditableTitle(seoResult.title || '');
      setEditableDescription(seoResult.description || '');
      const rawTags = seoResult.tags;
      const tagsStr = Array.isArray(rawTags) ? rawTags.join(', ') : (typeof rawTags === 'string' ? rawTags : '');
      setEditableTags(tagsStr);
    }
  }, [seoResult]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleCopyAll = () => {
    const fullText = `TITRE OPTIMISÉ:\n${editableTitle}\n\nDESCRIPTION, SPECS & FAQ:\n${editableDescription}\n\nTAGS (13):\n${editableTags}`;
    handleCopy(fullText, 'all');
  };

  const handleLocalImageUpload = (files: FileList | null, tab: 'Products' | 'Images' | 'Product Listing') => {
    if (!files || files.length === 0) return;
    props.handleImageUpload(files, tab);
  };

  const handleGenPrompts = async (forcedImages?: UploadedImage[]) => {
    const imagesToUse = forcedImages || props.promptsTabRefImages;
    if (imagesToUse.length === 0 && !productName) {
      alert("Veuillez importer une photo produit ou donner un nom à votre article.");
      return;
    }
    setIsLoading(true);
    try {
      const bgOption = BACKGROUND_OPTIONS.find(b => b.id === selectedBg);
      const bgPrompt = bgOption?.prompt || "";
      const res = await generatePrompts(props.userApiKey, productName, bgPrompt, imagesToUse, chatInput, inAndOutMode, numPrompts);
      props.setGeneratedPrompts(res);
    } catch (e) { 
      console.error(e);
      alert(e instanceof Error ? e.message : String(e)); 
    }
    finally { setIsLoading(false); }
  };

  const nextImage = () => {
    if (selectedImgIndex !== null && props.generatedImages.length > 0) {
      setSelectedImgIndex((selectedImgIndex + 1) % props.generatedImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImgIndex !== null && props.generatedImages.length > 0) {
      setSelectedImgIndex((selectedImgIndex - 1 + props.generatedImages.length) % props.generatedImages.length);
    }
  };

  const renderRefGrid = (images: UploadedImage[], tab: 'Products' | 'Images' | 'Product Listing') => (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {images.map(img => (
        <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-700 group shadow-lg bg-gray-900">
          <img src={`data:${img.mimeType};base64,${img.data}`} className="w-full h-full object-contain" alt="Référence" />
          <button 
            onClick={() => props.handleRemoveImage(img.id, tab)} 
            className="absolute top-1 right-1 bg-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      ))}
      {(tab !== 'Product Listing' || images.length === 0) && (
        <label className="aspect-square border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 transition-all bg-gray-800/20 hover:bg-gray-800/40 group">
          <span className="text-3xl text-gray-500 mb-1 text-white group-hover:scale-110 transition-transform">+</span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-white">Importer</span>
          <input type="file" className="hidden" onChange={e => handleLocalImageUpload(e.target.files, tab)} accept="image/*" />
        </label>
      )}
    </div>
  );

  const handleGenSeo = async () => {
    if (!props.ficheProduitImageBase64) return;
    setIsLoading(true);
    const combinedContext = `
      Product Name: ${productName}
      Image Details: ${ficheProduitDetails}
      Variations: ${seoVariations}
      Materials: ${seoMaterials}
      Additional Info: ${seoStoryDetails}
    `;
    try {
      const res = await generateSeoContent(props.userApiKey, props.ficheProduitImageBase64, props.ficheProduitImageMimeType!, combinedContext);
      setSeoResult(res);
    } catch (e) { alert(e instanceof Error ? e.message : String(e)); }
    finally { setIsLoading(false); }
  };

  const currentModalImage = selectedImgIndex !== null ? props.generatedImages[selectedImgIndex] : null;

  return (
    <div className="w-3/5 bg-[#181a1f] p-8 rounded-[24px] shadow-2xl flex flex-col overflow-y-auto border border-gray-800 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      {props.activeNav === 'Products' && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-3xl font-black mb-4 tracking-tight text-white uppercase">Catalogue Produits</h2>
          <p className="text-gray-400 mb-6 text-lg">Générez des mises en scène professionnelles "réalistes à mort".</p>

          <div className="bg-violet-500/5 p-4 rounded-2xl border border-violet-500/10 mb-8 text-[11px] leading-relaxed">
             <h4 className="font-black text-violet-400 uppercase tracking-widest mb-2">Conseils :</h4>
             <p className="text-gray-400 mb-1"><span className="text-white font-bold">Cohérent Pro :</span> Analyse automatiquement votre produit pour créer le décor le plus réaliste possible.</p>
             <p className="text-gray-400"><span className="text-white font-bold">Quantité :</span> Sélectionnez de 1 à 12 prompts selon vos besoins.</p>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-widest flex items-center">
               <span className="mr-3 p-2 bg-violet-500/10 rounded-lg">📸</span> 1. Photo du Produit
            </h3>
            <div className="flex items-center space-x-3 bg-gray-800/40 px-4 py-2 rounded-xl border border-gray-700">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Mode In-and-Out</span>
              <button 
                onClick={() => setInAndOutMode(!inAndOutMode)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${inAndOutMode ? GRADIENT_PURPLE_PINK : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${inAndOutMode ? 'left-7 shadow-lg' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
          {renderRefGrid(props.promptsTabRefImages, 'Products')}

          <div className="mb-10">
            <h3 className="text-sm font-bold mb-4 text-violet-400 uppercase tracking-widest flex items-center">
               <span className="mr-3 p-2 bg-violet-500/10 rounded-lg">🔢</span> 2. Nombre de Prompts ({numPrompts})
            </h3>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                <button
                  key={num}
                  onClick={() => setNumPrompts(num)}
                  className={`w-10 h-10 rounded-xl font-black transition-all ${numPrompts === num ? GRADIENT_PURPLE_PINK + ' scale-110 shadow-lg text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-end mb-4 mt-8">
             <h3 className="text-sm font-bold text-violet-400 uppercase tracking-widest flex items-center">
                <span className="mr-3 p-2 bg-violet-500/10 rounded-lg">🎨</span> 3. Style de Fond
             </h3>
             <span className="text-[10px] text-gray-500 font-bold animate-pulse italic uppercase tracking-wider">Défiler →</span>
          </div>

          <div className="flex overflow-x-auto space-x-4 pb-8 mb-6 no-scrollbar snap-x snap-mandatory">
            {BACKGROUND_OPTIONS.map(bg => (
              <button
                key={bg.id}
                onClick={() => setSelectedBg(bg.id)}
                className={`flex-shrink-0 w-40 p-5 rounded-[20px] border-2 text-left transition-all duration-300 snap-start ${
                  selectedBg === bg.id 
                    ? 'border-violet-500 bg-violet-500/10 scale-105 shadow-xl shadow-violet-500/10' 
                    : 'border-gray-800 bg-gray-800/40 hover:border-gray-700 hover:bg-gray-800/60'
                }`}
              >
                <div className="text-4xl mb-4 transform transition-transform">{bg.emoji}</div>
                <div className={`font-black text-xs uppercase tracking-tight mb-1 ${selectedBg === bg.id ? 'text-violet-300' : 'text-gray-300'}`}>{bg.label}</div>
                <div className="text-[10px] text-gray-500 leading-tight line-clamp-2 opacity-80">{bg.description}</div>
              </button>
            ))}
          </div>

          <h3 className="text-sm font-bold mb-4 text-violet-400 uppercase tracking-widest flex items-center">
             <span className="mr-3 p-2 bg-violet-500/10 rounded-lg">💬</span> 4. Raffinement IA
          </h3>
          <textarea 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            placeholder="Ex: 'Lumière dorée du matin à travers une fenêtre'..." 
            className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-2xl mb-8 focus:ring-2 focus:ring-violet-500 outline-none transition-all h-32 text-sm text-white" 
          />

          <h3 className="text-sm font-bold mb-4 text-violet-400 uppercase tracking-widest flex items-center">
             <span className="mr-3 p-2 bg-violet-500/10 rounded-lg">🏷️</span> 5. Nom du Produit
          </h3>
          <input 
            value={productName} 
            onChange={e => setProductName(e.target.value)} 
            placeholder="Ex: Mug en Céramique Artisanal..." 
            className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-2xl mb-10 focus:ring-2 focus:ring-violet-500 outline-none transition-all text-white font-medium" 
          />
          
          <button 
            onClick={() => handleGenPrompts()} 
            disabled={isLoading} 
            className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest ${GRADIENT_PURPLE_PINK} ${HOVER_GRADIENT_PURPLE_PINK} shadow-2xl disabled:opacity-50 text-white`}
          >
            {isLoading ? <LoadingSpinner message="Analyse & Création..." size="sm" color="text-white" /> : `Générer Mes ${numPrompts} Suggestions`}
          </button>
        </div>
      )}

      {props.activeNav === 'Images' && (
        <div className="animate-in fade-in duration-500 pb-20">
           <h2 className="text-3xl font-black mb-10 tracking-tight text-white uppercase">Studio Rendu</h2>
           
           <div className="mb-12 bg-gray-800/20 p-8 rounded-[32px] border border-gray-800">
             <h3 className="text-sm font-black mb-6 text-violet-400 uppercase tracking-widest flex items-center">
               <span className="mr-3 p-2 bg-violet-500/10 rounded-lg">📸</span> Photo Maîtresse
             </h3>
             {renderRefGrid(props.imagesTabRefImages, 'Images')}
           </div>

           <div className="grid grid-cols-2 gap-6">
              {props.generatedImages.map((img, idx) => (
                <div key={img.id} className="bg-gray-800/40 p-4 rounded-3xl border border-gray-700 relative group shadow-lg hover:border-violet-500/50 transition-colors">
                   {img.loading ? (
                      <div className="aspect-square flex flex-col items-center justify-center bg-gray-900/50 rounded-2xl">
                        <LoadingSpinner size="md" color="text-violet-500" message="Rendu..." />
                      </div>
                   ) : img.error ? (
                      <div className="aspect-square flex items-center justify-center p-6 text-center text-xs text-red-400 bg-gray-900/50 rounded-2xl">
                        {img.error}
                      </div>
                   ) : (
                      <>
                        <img 
                          src={img.url!} 
                          className="w-full aspect-square object-cover rounded-2xl mb-4 shadow-xl cursor-zoom-in hover:scale-[1.02] transition-transform duration-300" 
                          onClick={() => setSelectedImgIndex(idx)} 
                          alt="Rendu" 
                        />
                        <button 
                          onClick={() => downloadImage(img.url!, 'rendu_nano')} 
                          className="absolute top-6 right-6 p-3 bg-black/60 backdrop-blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-violet-600 shadow-xl"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </>
                   )}
                   <div className="px-2">
                     <p className="text-[9px] font-black uppercase text-violet-400 mb-1 tracking-widest opacity-60">Scénario :</p>
                     <p className="text-[10px] text-gray-300 line-clamp-2 italic">{img.prompt}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {props.activeNav === 'Product Listing' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight text-white uppercase">Expert SEO Etsy (100% Opti)</h2>
              <p className="text-gray-400 text-lg">Recherche AliExpress/Amazon + Storytelling + FAQ Fluide.</p>
            </div>
            {seoResult && (
              <button 
                onClick={handleCopyAll}
                className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${GRADIENT_PURPLE_PINK} text-white shadow-xl hover:scale-105 active:scale-95 flex items-center`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {copyStatus === 'all' ? 'Copié !' : 'Tout Copier'}
              </button>
            )}
          </div>

          <div className="bg-violet-500/5 p-6 rounded-3xl border border-violet-500/20 mb-8 text-sm">
             <h4 className="text-xs font-black text-violet-400 uppercase tracking-widest mb-3">🛡️ FAQ & Aide SEO :</h4>
             <p className="text-gray-400 italic leading-relaxed">Importez votre rendu final et complétez les informations ci-dessous. L'IA fusionnera vos détails avec ses recherches web pour créer une fiche exceptionnelle.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <div className="bg-gray-800/30 border-2 border-dashed border-gray-700 p-8 rounded-[32px] text-center transition-colors hover:border-violet-500/50 flex flex-col justify-center items-center">
                {props.ficheProduitImageBase64 ? (
                  <img src={`data:${props.ficheProduitImageMimeType};base64,${props.ficheProduitImageBase64}`} className="max-h-64 rounded-2xl mb-4 shadow-xl border-2 border-gray-800" alt="SEO Input" />
                ) : (
                  <div className="text-gray-600 font-bold uppercase tracking-widest italic opacity-50 mb-4">Importer rendu final</div>
                )}
                <label className="cursor-pointer text-violet-400 font-black uppercase tracking-widest text-[10px] hover:text-violet-300 underline underline-offset-8">
                  Sélectionner l'image
                  <input type="file" className="hidden" onChange={e => handleLocalImageUpload(e.target.files, 'Product Listing')} />
                </label>
              </div>
              <div>
                <h3 className="text-[10px] font-black mb-2 text-violet-400 uppercase tracking-[0.2em] flex items-center">
                  <span className="mr-2">✍️</span> Détails de l'Image
                </h3>
                <textarea 
                  value={ficheProduitDetails} 
                  onChange={e => setFicheProduitDetails(e.target.value)} 
                  placeholder="Ex: Photo prise en lumière naturelle, produit posé sur une table en bois..." 
                  className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all text-sm text-white h-32 resize-none" 
                />
              </div>
            </div>

            <div className="space-y-4">
               <div>
                  <h3 className="text-[10px] font-black mb-2 text-violet-400 uppercase tracking-[0.2em] flex items-center">
                    <span className="mr-2">🏷️</span> Nom du Produit
                  </h3>
                  <input 
                    value={productName} 
                    onChange={e => setProductName(e.target.value)} 
                    placeholder="Ex: Mug Céramique Nordique" 
                    className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all text-sm text-white" 
                  />
               </div>
               <div>
                  <h3 className="text-[10px] font-black mb-2 text-violet-400 uppercase tracking-[0.2em] flex items-center">
                    <span className="mr-2">🎨</span> Variantes & Couleurs
                  </h3>
                  <textarea 
                    value={seoVariations} 
                    onChange={e => setSeoVariations(e.target.value)} 
                    placeholder="Ex: Dispo en Bleu, Vert, Rouge. Tailles S, M, L." 
                    className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all text-sm text-white h-24 resize-none" 
                  />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
             <div>
                <h3 className="text-[10px] font-black mb-2 text-violet-400 uppercase tracking-[0.2em] flex items-center">
                  <span className="mr-2">⚒️</span> Matériaux & Fabrication
                </h3>
                <textarea 
                  value={seoMaterials} 
                  onChange={e => setSeoMaterials(e.target.value)} 
                  placeholder="Ex: Céramique mate, Peint à la main, Éco-responsable." 
                  className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all text-sm text-white h-32 resize-none" 
                />
             </div>
             <div>
                <h3 className="text-[10px] font-black mb-2 text-violet-400 uppercase tracking-[0.2em] flex items-center">
                  <span className="mr-2">📖</span> Détails Storytelling
                </h3>
                <textarea 
                  value={seoStoryDetails} 
                  onChange={e => setSeoStoryDetails(e.target.value)} 
                  placeholder="Ex: Inspiré par la nature, Idéal pour un cadeau de Noël." 
                  className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all text-sm text-white h-32 resize-none" 
                />
             </div>
          </div>

          <button onClick={handleGenSeo} disabled={isLoading || !props.ficheProduitImageBase64} className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest ${GRADIENT_PURPLE_PINK} mb-12 shadow-2xl transform transition-all active:scale-95 disabled:opacity-50 text-white`}>
            {isLoading ? <LoadingSpinner size="sm" color="text-white" message="Expert SEO en action..." /> : 'Générer la Fiche Exceptionnelle'}
          </button>

          {seoResult && (
            <div className="space-y-10 pb-20">
              <div className="bg-gray-800/60 p-8 rounded-[32px] border border-gray-700 shadow-2xl group relative">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-violet-400 font-black uppercase tracking-[0.2em] text-[10px]">Titre Etsy Opti</h4>
                  <button onClick={() => handleCopy(editableTitle, 'title')} className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-[10px] font-black text-violet-300 transition-all rounded-xl border border-violet-500/30">
                    {copyStatus === 'title' ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <input 
                    value={editableTitle} 
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="w-full bg-gray-900/50 text-xl font-bold text-white outline-none p-4 border border-gray-700 rounded-xl focus:ring-1 focus:ring-violet-500/30"
                />
              </div>

              <div className="bg-gray-800/60 p-8 rounded-[32px] border border-gray-700 shadow-2xl group relative">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-violet-400 font-black uppercase tracking-[0.2em] text-[10px]">Storytelling, Specs & FAQ Fluide</h4>
                  <button onClick={() => handleCopy(editableDescription, 'desc')} className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-[10px] font-black text-violet-300 transition-all rounded-xl border border-violet-500/30">
                    {copyStatus === 'desc' ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <textarea 
                    value={editableDescription} 
                    onChange={(e) => setEditableDescription(e.target.value)}
                    className="w-full bg-gray-900/50 text-sm text-gray-200 outline-none p-4 border border-gray-700 rounded-xl min-h-[500px] resize-none focus:ring-1 focus:ring-violet-500/30 leading-relaxed"
                />
              </div>

              <div className="bg-gray-800/60 p-8 rounded-[32px] border border-gray-700 shadow-2xl group relative">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-violet-400 font-black uppercase tracking-[0.2em] text-[10px]">13 Tags Haute-Valeur</h4>
                  <button onClick={() => handleCopy(editableTags, 'tags')} className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-[10px] font-black text-violet-300 transition-all rounded-xl border border-violet-500/30">
                    {copyStatus === 'tags' ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <textarea 
                  value={editableTags}
                  onChange={(e) => setEditableTags(e.target.value)}
                  className="w-full bg-gray-900/50 text-xs text-gray-300 outline-none p-4 border border-gray-700 rounded-xl resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Carrousel Modal */}
      <Modal isOpen={selectedImgIndex !== null} onClose={() => setSelectedImgIndex(null)}>
        {currentModalImage && (
          <div className="relative flex flex-col items-center justify-center h-full group">
            <div className="relative max-w-full max-h-[85vh] flex items-center justify-center">
              <img 
                src={currentModalImage.url!} 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-2 border-gray-800" 
                alt="Zoomed Rendu" 
              />
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-violet-600 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 shadow-2xl"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-violet-600 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 shadow-2xl"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              <button onClick={(e) => { e.stopPropagation(); downloadImage(currentModalImage.url!, 'rendu_high_res'); }} className={`absolute bottom-6 right-6 p-4 rounded-2xl font-black text-xs uppercase tracking-widest ${GRADIENT_PURPLE_PINK} text-white shadow-2xl transform hover:scale-105 transition-all flex items-center`}><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Télécharger</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MainContent;
