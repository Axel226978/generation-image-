
import React, { useState, useEffect } from 'react';
import { GRADIENT_PURPLE_PINK, HOVER_GRADIENT_PURPLE_PINK } from '../constants';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [key, setKey] = useState(currentKey);

  useEffect(() => {
    setKey(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(key);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#181a1f] p-10 rounded-[32px] shadow-2xl w-full max-w-lg relative border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tight">Configuration API</h2>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Votre clé API est stockée localement dans votre navigateur. Vous devez fournir votre propre clé Gemini pour utiliser le studio.
        </p>
        <textarea
          className="w-full p-5 bg-gray-800 border border-gray-700 rounded-2xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#9b59ff] mb-6 font-mono text-sm"
          rows={3}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Collez votre clé API Gemini ici..."
        />
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 font-bold mb-8 block underline underline-offset-4 text-sm">
          Obtenir une clé sur Google AI Studio →
        </a>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-bold transition-all">
            Annuler
          </button>
          <button onClick={handleSave} className={`px-8 py-3 rounded-xl font-black text-white transition-all duration-200 ${GRADIENT_PURPLE_PINK} ${HOVER_GRADIENT_PURPLE_PINK} uppercase tracking-wider`}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
