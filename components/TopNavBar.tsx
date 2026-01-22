
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { GRADIENT_PURPLE_PINK } from '../constants';

interface TopNavBarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isApiKeyValid: boolean | null;
  onApiKeyClick: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ activeNav, setActiveNav, isApiKeyValid, onApiKeyClick }) => {
  const navItems = [
    { name: 'Products', icon: '📝', label: 'Products' },
    { name: 'Images', icon: '🖼️', label: 'Images' },
    { name: 'Product Listing', icon: '🏷️', label: 'Fiche Produit' },
    { name: 'Test API', icon: '🔌', label: 'Ma Clé API' },
  ];

  const statusMessage = isApiKeyValid === null ? "Vérification..." : isApiKeyValid ? "Clé Active" : "Clé Manquante";
  const statusColor = isApiKeyValid === null ? "bg-yellow-500" : isApiKeyValid ? "bg-green-600" : "bg-red-600";
  const actionText = isApiKeyValid ? "Changer" : "Configurer";

  return (
    <nav className="bg-[#111318] p-4 mx-6 mt-6 rounded-[20px] shadow-lg flex items-center justify-between font-sans border border-gray-800">
      <div className="text-3xl font-black text-yellow-400 ml-4 flex items-center uppercase tracking-tighter">
        <span role="img" aria-label="icon" className="mr-3 text-2xl">🍌</span>
        Nano Banana
      </div>

      <div className="flex space-x-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            className={`px-5 py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center ${activeNav === item.name ? `${GRADIENT_PURPLE_PINK} text-white shadow-xl` : 'text-[#a0a0a0] hover:bg-gray-800 hover:text-white'}`}
            onClick={() => setActiveNav(item.name)}
          >
            <span className="mr-2 text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4 mr-4">
        <button
          onClick={onApiKeyClick}
          className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <span className="text-xs font-bold text-[#a0a0a0] uppercase tracking-widest">Statut :</span>
          <div className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${statusColor} text-white flex items-center`}>
            {isApiKeyValid === null && <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
            <span>{statusMessage}</span>
          </div>
          <span className="text-violet-400 font-bold text-xs uppercase underline underline-offset-4">{actionText}</span>
        </button>
      </div>
    </nav>
  );
};

export default TopNavBar;
