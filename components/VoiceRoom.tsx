import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { base64ToUint8Array, createPcmBlob, decodeAudioData } from '../services/audioUtils';

interface VoiceRoomProps {
  apiKey: string;
}

const VoiceRoom: React.FC<VoiceRoomProps> = ({ apiKey }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // User speaking
  const [aiSpeaking, setAiSpeaking] = useState(false); // AI speaking
  const [error, setError] = useState<string | null>(null);

  // Audio Context Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  // Gemini Session Refs
  const sessionRef = useRef<any>(null); // To hold the active session
  const nextStartTimeRef = useRef<number>(0);

  // Cleanup function
  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
    setAiSpeaking(false);
  };

  const startSession = async () => {
    setError(null);
    try {
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      // 2. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey });
      
      // 4. Connect Live Session
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'You are a warm, engaging host in a social voice lounge. Speak concisely. Use Bengali if the user speaks Bengali.',
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setIsConnected(true);

            // Setup Input Processing (Mic -> Gemini)
            if (!inputAudioContextRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            // Buffer size 4096, 1 input channel, 1 output channel
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Simple check for silence to toggle UI state
              const rms = Math.sqrt(inputData.reduce((sum, val) => sum + val * val, 0) / inputData.length);
              setIsSpeaking(rms > 0.02);

              const pcmBlob = createPcmBlob(inputData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output (Gemini -> Speaker)
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              setAiSpeaking(true);
              
              // Reset AI speaking indicator after a short delay if no new chunks come
              setTimeout(() => setAiSpeaking(false), 500);

              const ctx = outputAudioContextRef.current;
              // Ensure we don't schedule in the past
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(audioData),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              
              nextStartTimeRef.current += audioBuffer.duration;
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              console.log('Interrupted');
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            stopSession();
          },
          onerror: (e) => {
            console.error('Gemini Live Error', e);
            setError("Connection error. Please try again.");
            stopSession();
          }
        }
      });

      // Save session reference (promise wrapper)
      sessionRef.current = sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to access microphone or connect.");
      stopSession();
    }
  };

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-40">
         <div className="absolute top-10 left-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
         <div className="absolute top-10 right-10 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-8 left-20 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="z-10 text-center max-w-md w-full">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">Voice Lounge</h2>
        <p className="text-slate-600 mb-10 font-medium">Hang out and talk with Bondhu AI</p>

        {/* Visualizer Circle */}
        <div className="relative w-56 h-56 mx-auto mb-12 flex items-center justify-center">
          {/* Outer Glow - Active when AI talks */}
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${aiSpeaking ? 'bg-pink-400/30 scale-125 blur-xl' : 'bg-white/50 scale-100 blur-sm'}`}></div>
          
          {/* Middle Ring */}
          <div className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-1000 ${isConnected ? 'border-pink-300 animate-spin-slow' : 'border-slate-200'}`}></div>

          {/* Inner Circle - Active when User talks */}
          <div className={`relative w-44 h-44 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-200 z-10
            ${isConnected 
              ? (isSpeaking ? 'border-purple-500 bg-white scale-105' : 'border-pink-500 bg-white') 
              : 'border-slate-200 bg-slate-50'
            }`}>
            {isConnected ? (
              <div className="text-7xl animate-pulse">
                {aiSpeaking ? '🤖' : (isSpeaking ? '🎙️' : '👂')}
              </div>
            ) : (
              <span className="text-5xl grayscale opacity-30">🔌</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {!isConnected ? (
            <button
              onClick={startSession}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-pink-200 transform transition-all hover:scale-105"
            >
              Start Conversation
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="w-full bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 font-bold py-4 px-8 rounded-2xl transition-all shadow-sm"
            >
              End Call
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="mt-8 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Status: {isConnected ? <span className="text-green-500">Connected</span> : 'Disconnected'}
        </div>
      </div>
    </div>
  );
};

export default VoiceRoom;