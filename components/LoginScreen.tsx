
import React from 'react';
import { GRADIENT_PURPLE_PINK, HOVER_GRADIENT_PURPLE_PINK } from '../constants';

interface LoginScreenProps {
  onEnter: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e0f12] text-white p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-400 mb-4 flex items-center justify-center tracking-tighter">
          <span role="img" aria-label="banana icon" className="mr-4 text-5xl">🍌</span>
          Nano Banana
        </h1>
        <p className="text-xl text-gray-400 mb-8 font-medium">Votre studio créatif e-commerce, propulsé par Gemini.</p>
        <button
          onClick={onEnter}
          className={`px-12 py-5 rounded-xl font-black text-xl transition-all duration-200 ${GRADIENT_PURPLE_PINK} text-white shadow-2xl ${HOVER_GRADIENT_PURPLE_PINK} active:scale-95 transform hover:scale-105 uppercase tracking-widest`}
        >
          Entrer dans le Studio
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
