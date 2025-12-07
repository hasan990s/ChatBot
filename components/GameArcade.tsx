import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, TriviaQuestion } from '../types';

interface GameArcadeProps {
  apiKey: string;
}

type GameMode = 'MENU' | 'TRIVIA' | 'BULLSEYE';

const GameArcade: React.FC<GameArcadeProps> = ({ apiKey }) => {
  const [gameMode, setGameMode] = useState<GameMode>('MENU');
  
  // -- Shared / Trivia State --
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    currentQuestion: null,
    loading: false,
    gameOver: false,
  });
  const [selectedTopic, setSelectedTopic] = useState('General Knowledge');
  const [feedback, setFeedback] = useState<string | null>(null);

  // -- Bullseye State --
  const [timeLeft, setTimeLeft] = useState(30);
  const [targetPos, setTargetPos] = useState({ top: 50, left: 50 });
  const [aiRank, setAiRank] = useState<string>('');

  const topics = ['General Knowledge', 'Science', 'Movies', 'History', 'Technology', 'Sports'];

  // --- Trivia Logic ---
  const fetchTriviaQuestion = async (resetScore = false) => {
    setGameState(prev => ({ 
      ...prev, 
      loading: true, 
      isPlaying: true,
      gameOver: false,
      score: resetScore ? 0 : prev.score 
    }));
    setFeedback(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a fun and interesting trivia question about ${selectedTopic}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "difficulty"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}') as TriviaQuestion;
      
      setGameState(prev => ({
        ...prev,
        loading: false,
        currentQuestion: data
      }));

    } catch (error) {
      console.error("Game Error", error);
      setGameState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleTriviaAnswer = (answer: string) => {
    if (!gameState.currentQuestion) return;

    if (answer === gameState.currentQuestion.correctAnswer) {
      setFeedback('Correct! 🎉');
      setGameState(prev => ({ ...prev, score: prev.score + 10 }));
      setTimeout(() => fetchTriviaQuestion(), 1500);
    } else {
      setFeedback(`Wrong! The answer was ${gameState.currentQuestion.correctAnswer}`);
      setGameState(prev => ({ ...prev, gameOver: true }));
    }
  };

  // --- Bullseye Logic ---
  const startBullseye = () => {
    setGameMode('BULLSEYE');
    setGameState({
      isPlaying: true,
      score: 0,
      loading: false,
      gameOver: false,
      currentQuestion: null
    });
    setTimeLeft(30);
    setAiRank('');
    moveTarget();
  };

  const moveTarget = () => {
    const top = Math.random() * 80 + 10; // 10% to 90%
    const left = Math.random() * 80 + 10;
    setTargetPos({ top, left });
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!gameState.isPlaying) return;
    
    // Play sound effect could go here
    setGameState(prev => ({ ...prev, score: prev.score + 1 }));
    moveTarget();
  };

  // Bullseye Timer
  useEffect(() => {
    if (gameMode === 'BULLSEYE' && gameState.isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameMode === 'BULLSEYE' && timeLeft === 0 && gameState.isPlaying) {
      endBullseyeGame();
    }
  }, [gameMode, gameState.isPlaying, timeLeft]);

  const endBullseyeGame = async () => {
    setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true, loading: true }));
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `I played a clicking reaction game and scored ${gameState.score} points in 30 seconds. Give me a cool, funny, or impressive 3-word rank title for this performance. Do not use quotes.`,
      });
      setAiRank(response.text || 'Cyber Sharpshooter');
    } catch (e) {
      setAiRank('Mystery Gunner');
    } finally {
      setGameState(prev => ({ ...prev, loading: false }));
    }
  };

  // --- Render Functions ---

  // 1. Menu
  if (gameMode === 'MENU') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 mb-2">
          Game Arcade
        </h2>
        <p className="text-slate-500 mb-10 font-medium">Choose your challenge</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Trivia Card */}
          <button 
            onClick={() => { setGameMode('TRIVIA'); setGameState(prev => ({ ...prev, gameOver: false, isPlaying: false })); }}
            className="group relative bg-white p-8 rounded-3xl border-2 border-transparent hover:border-pink-200 shadow-xl shadow-pink-100 transition-all transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-left">
              <span className="text-5xl mb-4 block">🧠</span>
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-pink-600 transition-colors">Trivia Master</h3>
              <p className="text-slate-500 mt-2">Test your knowledge with AI-generated questions across multiple topics.</p>
            </div>
          </button>

          {/* Bullseye Card */}
          <button 
            onClick={startBullseye}
            className="group relative bg-white p-8 rounded-3xl border-2 border-transparent hover:border-purple-200 shadow-xl shadow-purple-100 transition-all transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 text-left">
              <span className="text-5xl mb-4 block">🎯</span>
              <h3 className="text-2xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Neon Sharpshooter</h3>
              <p className="text-slate-500 mt-2">Test your reflexes. Hit as many targets as you can in 30 seconds.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 2. Trivia Game
  if (gameMode === 'TRIVIA') {
    if (!gameState.isPlaying && !gameState.gameOver) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
          <button onClick={() => setGameMode('MENU')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600">← Back</button>
          <div className="mb-6 text-6xl">🎲</div>
          <h2 className="text-4xl font-extrabold text-slate-800 mb-8">Setup Trivia</h2>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-pink-100 w-full max-w-md border border-pink-100">
            <label className="block text-slate-500 mb-4 text-sm font-bold uppercase tracking-wide">Select Topic</label>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {topics.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`p-3 rounded-xl text-sm font-semibold transition-all ${selectedTopic === t ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200' : 'bg-slate-50 text-slate-600 hover:bg-pink-50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchTriviaQuestion(true)}
              disabled={gameState.loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
            >
              {gameState.loading ? 'Loading...' : 'Start Game'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setGameMode('MENU')}
            className="text-slate-500 hover:text-pink-600 font-medium"
          >
            ← Exit
          </button>
          <div className="bg-white px-6 py-2 rounded-full border border-pink-100 text-pink-600 font-bold shadow-sm">
            Score: {gameState.score}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
          {gameState.loading ? (
            <div className="text-center">
              <div className="animate-spin text-5xl mb-4">✨</div>
              <div className="text-slate-400 font-medium animate-pulse">Consulting the AI...</div>
            </div>
          ) : gameState.gameOver ? (
            <div className="text-center bg-white p-10 rounded-3xl shadow-xl shadow-red-100 border border-red-50">
              <h3 className="text-4xl font-extrabold text-red-500 mb-2">Game Over</h3>
              <p className="text-slate-600 mb-8 text-lg">{feedback}</p>
              <p className="text-2xl text-slate-800 font-bold mb-10">Final Score: {gameState.score}</p>
              <button
                onClick={() => fetchTriviaQuestion(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-green-200 transition-transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          ) : (
            gameState.currentQuestion && (
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur p-8 rounded-3xl border border-pink-100 shadow-xl shadow-indigo-100/50">
                  <div className="text-xs text-pink-500 font-bold mb-3 uppercase tracking-wider">
                    {gameState.currentQuestion.difficulty} • {selectedTopic}
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold text-slate-800 leading-tight">
                    {gameState.currentQuestion.question}
                  </h3>
                </div>

                {feedback && (
                   <div className={`text-center font-bold p-4 rounded-2xl ${feedback.includes('Correct') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {feedback}
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriviaAnswer(option)}
                      disabled={!!feedback}
                      className="p-5 bg-white hover:bg-indigo-50 text-left text-slate-700 rounded-2xl transition-all border border-slate-100 hover:border-indigo-300 shadow-sm hover:shadow-md disabled:opacity-50 font-medium"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // 3. Bullseye Game
  if (gameMode === 'BULLSEYE') {
    return (
      <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden select-none">
        {/* Background gradient specifically for this game */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-white to-purple-100 z-0 pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-20 flex justify-between items-center p-6 bg-white/50 backdrop-blur-sm border-b border-pink-100">
           <button 
             onClick={() => setGameMode('MENU')}
             className="text-slate-500 hover:text-pink-600 font-bold bg-white px-4 py-2 rounded-xl shadow-sm"
           >
             EXIT
           </button>
           
           <div className="flex gap-4">
             <div className="bg-white px-6 py-2 rounded-xl shadow-sm border border-purple-100">
               <span className="text-xs text-slate-400 font-bold uppercase block">Time</span>
               <span className={`text-2xl font-mono font-bold ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                 00:{timeLeft.toString().padStart(2, '0')}
               </span>
             </div>
             <div className="bg-white px-6 py-2 rounded-xl shadow-sm border border-pink-100">
               <span className="text-xs text-slate-400 font-bold uppercase block">Score</span>
               <span className="text-2xl font-mono font-bold text-pink-600">{gameState.score}</span>
             </div>
           </div>
        </div>

        {/* Game Area */}
        {gameState.gameOver ? (
          <div className="relative z-20 flex-1 flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-purple-200 text-center max-w-md w-full border border-purple-50 animate-fade-in-up">
              <h3 className="text-3xl font-extrabold text-slate-800 mb-2">Time's Up!</h3>
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-6">
                {gameState.score}
              </div>
              
              {gameState.loading ? (
                 <div className="flex flex-col items-center justify-center h-20">
                   <div className="animate-spin h-8 w-8 border-4 border-pink-200 border-t-pink-500 rounded-full mb-2"></div>
                   <span className="text-sm text-slate-400">Analyzing performance...</span>
                 </div>
              ) : (
                <div className="mb-8">
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Rank Achieved</div>
                  <div className="text-xl font-bold text-purple-700 bg-purple-50 py-3 px-4 rounded-xl border border-purple-100">
                    "{aiRank}"
                  </div>
                </div>
              )}

              <button
                onClick={startBullseye}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
              >
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex-1 cursor-crosshair active:cursor-grabbing overflow-hidden">
            {/* The Target */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out group cursor-pointer"
              style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%` }}
              onMouseDown={handleTargetClick}
            >
              <div className="w-24 h-24 bg-pink-100/50 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
              <div className="w-20 h-20 bg-white rounded-full shadow-lg border-4 border-pink-500 flex items-center justify-center relative hover:scale-105 active:scale-95 transition-transform">
                <div className="w-12 h-12 bg-pink-50 rounded-full border-4 border-purple-400 flex items-center justify-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default GameArcade;