
import React from 'react';
import { GRADIENT_PURPLE_PINK, HOVER_GRADIENT_PURPLE_PINK } from './constants';

interface RightPanelProps {
  activeNav: string;
  generatedPrompts: string[];
  onCopyPromptsToImages: (prompts: string[]) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ activeNav, generatedPrompts, onCopyPromptsToImages }) => {
  let icon: React.ReactNode;
  let title: string;
  let subtitle: string;
  let bgColor: string = 'bg-[#181a1f]'; 
  let showDynamicContent = false;

  const count = generatedPrompts.length;

  switch (activeNav) {
    case 'Images':
      icon = (
        <div className="text-6xl mb-6 opacity-20">🎨</div>
      );
      title = "Prêt pour les Images";
      subtitle = "Vos prompts sont chargés. Cliquez sur le bouton pour lancer la génération.";
      bgColor = 'bg-[#16181c]'; 
      break;
    case 'Products':
    case 'Prompts':
      if (count > 0) {
        showDynamicContent = true;
      } else {
        icon = (
          <div className="text-6xl mb-6 opacity-20">📝</div>
        );
        title = "Générateur de Prompts";
        subtitle = "Importez votre photo produit pour que l'IA puisse imaginer des mises en scène.";
      }
      break;
    case 'Product Listing':
      icon = (
        <div className="text-6xl mb-6 opacity-20">🏷️</div>
      );
      title = "Ventes & SEO Etsy";
      subtitle = "Utilisez vos meilleurs rendus pour générer des descriptions qui vendent.";
      break;
    case 'Test API':
      icon = (
        <div className="text-6xl mb-6 opacity-20">🔌</div>
      );
      title = "Contrôle Technique";
      subtitle = "Vérifiez que votre connexion avec Gemini est optimale.";
      break;
    default:
      icon = (
        <div className="text-6xl mb-6 opacity-20">🍌</div>
      );
      title = "Studio Nano Banana";
      subtitle = "Sélectionnez un outil pour commencer.";
  }

  return (
    <div className={`w-2/5 ${bgColor} p-8 rounded-[20px] shadow-xl flex flex-col text-[#a0a0a0] font-sans ${showDynamicContent ? 'items-start justify-start' : 'items-center justify-center'} overflow-y-auto border border-gray-800`}>
      {showDynamicContent ? (
        <>
          <h3 className="text-sm font-black text-violet-400 mb-6 uppercase tracking-[0.2em]">Vos {count} Prompts Générés :</h3>
          <div className="space-y-3 flex-1 mb-8 w-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
            {generatedPrompts.map((prompt, index) => (
              <div key={index} className="bg-gray-800/60 p-4 rounded-xl text-[11px] text-gray-300 border border-gray-700/50 leading-relaxed group hover:border-violet-500/30 transition-colors">
                <span className="font-black text-violet-400 mr-2">{`#${index + 1}`}</span>{prompt}
              </div>
            ))}
          </div>
          <button
            onClick={() => onCopyPromptsToImages(generatedPrompts)}
            className={`w-full py-5 rounded-xl font-black text-lg transition-all duration-300
                       ${GRADIENT_PURPLE_PINK} text-white shadow-2xl ${HOVER_GRADIENT_PURPLE_PINK} active:scale-95 uppercase tracking-[0.1em]`}
          >
            Utiliser & Générer les {count} Images
          </button>
          <p className="text-[10px] text-gray-500 mt-4 text-center w-full italic">Cela va transférer vos prompts et lancer automatiquement le studio d'images. ✨</p>
        </>
      ) : (
        <div className="text-center px-6">
          {icon}
          <p className="text-xl font-black text-white uppercase tracking-widest">{title}</p>
          <p className="text-sm text-gray-500 mt-4 leading-relaxed font-medium">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
