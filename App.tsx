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
          <div className="flex flex-col items-center justify-center h-full p-6 md:p-12 text-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 overflow-y-auto">
            <div className="mb-8 p-6 bg-white rounded-[2rem] shadow-xl shadow-pink-100 animate-bounce ring-1 ring-slate-100">
              <span className="text-5xl drop-shadow-md">🤖</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 mb-6 tracking-tight">
              Welcome to ChatBot
            </h1>
            <p className="text-xl text-slate-500 max-w-lg mx-auto mb-16 leading-relaxed font-medium">
              Your futuristic social hub. Chat with intelligent bots, hang out in the voice lounge, or challenge the AI in the arcade.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
              
              {/* Voice Lounge Card */}
              <button 
                onClick={() => setCurrentView(ViewState.VOICE)}
                className="relative group w-full text-left outline-none"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[2.5rem] opacity-30 group-hover:opacity-100 blur-[2px] group-hover:blur-md transition duration-500"></div>
                <div className="relative h-full bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-50 shadow-2xl shadow-slate-200/50 flex flex-col justify-between overflow-hidden group-hover:bg-slate-50 transition duration-300">
                  {/* Decor */}
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-pink-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition duration-700"></div>
                  
                  <div>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center text-4xl shadow-lg shadow-pink-200 mb-8 transform group-hover:scale-110 group-hover:-rotate-3 transition duration-300">
                       🎙️
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600 transition-all">
                      Voice Lounge
                    </h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                      Experience real-time voice conversations with ultra-low latency.
                    </p>
                  </div>
                  
                  <div className="mt-8 flex items-center text-pink-500 font-bold group-hover:translate-x-2 transition-transform">
                    <span>Enter Room</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>
                </div>
              </button>

              {/* Global Chat Card */}
              <button 
                onClick={() => setCurrentView(ViewState.CHAT)}
                className="relative group w-full text-left outline-none"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 rounded-[2.5rem] opacity-30 group-hover:opacity-100 blur-[2px] group-hover:blur-md transition duration-500"></div>
                <div className="relative h-full bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-50 shadow-2xl shadow-slate-200/50 flex flex-col justify-between overflow-hidden group-hover:bg-slate-50 transition duration-300">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition duration-700"></div>

                  <div>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center text-4xl shadow-lg shadow-purple-200 mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition duration-300">
                       💬
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 transition-all">
                      Global Chat
                    </h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                      Chat with the community and roleplay with AI characters.
                    </p>
                  </div>

                  <div className="mt-8 flex items-center text-violet-500 font-bold group-hover:translate-x-2 transition-transform">
                    <span>Start Chatting</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>
                </div>
              </button>

              {/* Arcade Card */}
              <button 
                onClick={() => setCurrentView(ViewState.GAME)}
                className="relative group w-full text-left outline-none"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-[2.5rem] opacity-30 group-hover:opacity-100 blur-[2px] group-hover:blur-md transition duration-500"></div>
                <div className="relative h-full bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-50 shadow-2xl shadow-slate-200/50 flex flex-col justify-between overflow-hidden group-hover:bg-slate-50 transition duration-300">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition duration-700"></div>

                  <div>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-4xl shadow-lg shadow-orange-200 mb-8 transform group-hover:scale-110 group-hover:-rotate-3 transition duration-300">
                       🎮
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 transition-all">
                      Arcade
                    </h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                      Challenge your skills in Trivia and Bullseye shooting games.
                    </p>
                  </div>

                  <div className="mt-8 flex items-center text-orange-500 font-bold group-hover:translate-x-2 transition-transform">
                    <span>Play Now</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>
                </div>
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