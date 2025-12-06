import React from 'react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: ViewState.HOME, label: 'Lounge', icon: '🏠' },
    { id: ViewState.CHAT, label: 'Global Chat', icon: '💬' },
    { id: ViewState.VOICE, label: 'Voice Room', icon: '🎙️' },
    { id: ViewState.GAME, label: 'Arcade', icon: '🎮' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-pink-100 md:relative md:w-64 md:h-screen md:border-t-0 md:border-r md:flex-col md:justify-start z-50 shadow-sm">
      <div className="p-6 hidden md:block">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
          Bondhu AI
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Virtual Social Hub</p>
      </div>
      
      <div className="flex flex-row md:flex-col justify-around md:justify-start md:px-4 md:gap-3 h-20 md:h-auto items-center md:items-stretch">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col md:flex-row items-center md:px-4 md:py-3 rounded-2xl transition-all duration-200
              ${currentView === item.id 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-200' 
                : 'text-slate-500 hover:text-pink-600 hover:bg-pink-50'
              }`}
          >
            <span className="text-xl md:mr-3">{item.icon}</span>
            <span className="text-xs md:text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;