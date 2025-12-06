import React, { useState } from 'react';
import Navigation from './components/Navigation';
import ChatRoom from './components/ChatRoom';
import VoiceRoom from './components/VoiceRoom';
import GameArcade from './components/GameArcade';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  
  // In a real app, you might want to handle this differently, but for this demo,
  // we access it directly. The prompt instructions guarantee this is available.
  const apiKey = process.env.API_KEY || '';

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 p-4 text-center">
        <div>
           <h1 className="text-2xl font-bold text-red-500 mb-2">Configuration Error</h1>
           <p className="text-slate-500">API_KEY environment variable is missing.</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.CHAT:
        return <ChatRoom apiKey={apiKey} />;
      case ViewState.VOICE:
        return <VoiceRoom apiKey={apiKey} />;
      case ViewState.GAME:
        return <GameArcade apiKey={apiKey} />;
      case ViewState.HOME:
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-indigo-50 via-white to-pink-50">
            <div className="mb-8 p-6 bg-white rounded-full shadow-xl shadow-pink-100 animate-bounce">
              <span className="text-5xl">🤖</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-6">
              Welcome to Bondhu AI
            </h1>
            <p className="text-xl text-slate-500 max-w-lg mx-auto mb-12 leading-relaxed">
              Your futuristic social hub. Chat with intelligent bots, hang out in the voice lounge, or challenge the AI in the arcade.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              <button 
                onClick={() => setCurrentView(ViewState.VOICE)}
                className="group p-8 bg-white border border-slate-100 rounded-3xl hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-100 transition-all text-left"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform bg-pink-50 w-16 h-16 rounded-2xl flex items-center justify-center">🎙️</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-pink-600 transition-colors">Voice Lounge</h3>
                <p className="text-slate-500">Real-time conversation</p>
              </button>

              <button 
                 onClick={() => setCurrentView(ViewState.CHAT)}
                 className="group p-8 bg-white border border-slate-100 rounded-3xl hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-100 transition-all text-left"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center">💬</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">Global Chat</h3>
                <p className="text-slate-500">Text messaging & roleplay</p>
              </button>

              <button 
                 onClick={() => setCurrentView(ViewState.GAME)}
                 className="group p-8 bg-white border border-slate-100 rounded-3xl hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100 transition-all text-left"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center">🎮</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">Arcade</h3>
                <p className="text-slate-500">Play trivia & games</p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-white text-slate-800">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 relative overflow-hidden h-[calc(100vh-80px)] md:h-screen">
        {renderView()}
      </main>
    </div>
  );
};

export default App;