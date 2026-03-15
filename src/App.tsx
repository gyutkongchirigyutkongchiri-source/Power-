/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Sparkles, 
  MessageSquare, 
  User, 
  Settings, 
  Info, 
  Trophy,
  Smartphone,
  Apple,
  ChevronRight,
  ArrowLeft,
  Copy,
  RefreshCw,
  Search,
  Send,
  Camera,
  Shield,
  FileText,
  HelpCircle,
  ExternalLink,
  Cpu,
  Zap,
  Wifi,
  Layers,
  Trash2,
  Battery,
  Monitor,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

type Tab = 'inicio' | 'ia' | 'chat' | 'perfil' | 'config' | 'info' | 'pro';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface UserProfile {
  username: string;
  avatar: string;
  bio: string;
}

interface SensitivitySettings {
  general: number;
  puntoRojo: number;
  mira2x: number;
  mira4x: number;
  francotirador: number;
  dpi: number;
  botonDisparo: number;
}

// --- Mock Data ---

const PRO_PLAYERS = [
  { name: 'Sinox', region: 'Brazil', followers: '2.1M+', role: 'Sniper Specialist', team: 'None', settings: { general: 170, puntoRojo: 140, mira2x: 135, mira4x: 173, francotirador: 120, dpi: 560, botonDisparo: 35 } },
  { name: 'Apelapato', region: 'Mexico', followers: '8.5M+', role: 'Rusher Agresivo', team: '65ons Esports', settings: { general: 189, puntoRojo: 193, mira2x: 167, mira4x: 173, francotirador: 181, dpi: 458, botonDisparo: 45 } },
  { name: 'L-gan', region: 'Indonesia', followers: '5.2M+', role: 'Pro Player', team: 'None', settings: { general: 195, puntoRojo: 188, mira2x: 172, mira4x: 178, francotirador: 185, dpi: 480, botonDisparo: 50 } },
  { name: 'White444', region: 'India', followers: '12M+', role: 'Headshot King', team: 'None', settings: { general: 185, puntoRojo: 190, mira2x: 165, mira4x: 160, francotirador: 170, dpi: 444, botonDisparo: 44 } },
  { name: 'BoykaFF', region: 'Brazil', followers: '3.8M+', role: 'Clutch Master', team: 'None', settings: { general: 192, puntoRojo: 186, mira2x: 170, mira4x: 175, francotirador: 180, dpi: 460, botonDisparo: 48 } },
  { name: 'Nobru', region: 'Brazil', followers: '15M+', role: 'Leyenda del FF', team: 'Fluxo', settings: { general: 186, puntoRojo: 182, mira2x: 164, mira4x: 158, francotirador: 172, dpi: 450, botonDisparo: 42 } },
];

// --- Components ---

const Button = ({ children, onClick, className = "", variant = "primary" }: { children: React.ReactNode, onClick?: () => void, className?: string, variant?: "primary" | "secondary" | "outline" }) => {
  const base = "px-6 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
    outline: "border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
  };
  
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string, key?: React.Key }) => (
  <div className={`bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState<'android' | 'ios' | null>(null);
  const [model, setModel] = useState('');
  const [generatedSettings, setGeneratedSettings] = useState<SensitivitySettings | null>(null);
  
  // AI Wizard State
  const [aiStep, setAiStep] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('COPIAR');

  // Config Chat State
  const [configInput, setConfigInput] = useState('');
  const [configChatHistory, setConfigChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: '¡Hola! Soy tu asistente técnico de Power Xit. ¿En qué puedo ayudarte a optimizar hoy? Puedo darte consejos sobre sensibilidad, FPS, lag, red y más.' }
  ]);
  const [isConfigChatLoading, setIsConfigChatLoading] = useState(false);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);

  const handleProfileSetup = async () => {
    if (!profileUsername.trim()) return;
    setIsGeneratingProfile(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bio: { type: Type.STRING },
              avatarPrompt: { type: Type.STRING }
            },
            required: ["bio", "avatarPrompt"]
          }
        },
        contents: `Genera una biografía corta y épica de jugador de Free Fire para el usuario "${profileUsername}". También describe brevemente cómo sería su avatar.`
      });

      const data = JSON.parse(response.text);
      // Using a random avatar from DiceBear for the visual part
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUsername}`;
      
      setUserProfile({
        username: profileUsername,
        avatar: avatarUrl,
        bio: data.bio
      });
    } catch (error) {
      console.error("Error generating profile:", error);
      // Fallback
      setUserProfile({
        username: profileUsername,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUsername}`,
        bio: "Jugador profesional de Power Xit listo para dominar el campo de batalla."
      });
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleSendConfigMessage = async () => {
    if (!configInput.trim() || isConfigChatLoading) return;

    const userMessage = configInput.trim();
    setConfigInput('');
    setConfigChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsConfigChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...configChatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: "Eres el Asistente Técnico de Power Xit, una aplicación líder en optimización de sensibilidad y rendimiento para juegos móviles (especialmente Free Fire). Tu objetivo es dar consejos profesionales, técnicos y útiles sobre: Sensibilidad, FPS, reducción de Lag, optimización de Red/Ping, configuración de DPI, gestión de Apps en segundo plano, limpieza de Caché, ahorro de Batería y ajustes Gráficos. Sé amable, experto y directo. Responde siempre en español.",
        }
      });

      const aiText = response.text || "Lo siento, no pude procesar tu solicitud. Inténtalo de nuevo.";
      
      setConfigChatHistory(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      setConfigChatHistory(prev => [...prev, { role: 'model', text: "Hubo un error al conectar con la IA técnica. Por favor, verifica tu conexión." }]);
    } finally {
      setIsConfigChatLoading(false);
    }
  };

  const handleCopySettings = () => {
    if (!generatedSettings) return;
    const text = `Sensibilidad Power Xit:
General: ${generatedSettings.general}
Punto Rojo: ${generatedSettings.puntoRojo}
Mira 2x: ${generatedSettings.mira2x}
Mira 4x: ${generatedSettings.mira4x}
Francotirador: ${generatedSettings.francotirador}
DPI: ${generatedSettings.dpi}
Botón Disparo: ${generatedSettings.botonDisparo}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopyButtonText('¡COPIADO!');
      setTimeout(() => setCopyButtonText('COPIAR'), 2000);
    });
  };

  const generateRandomSettings = (deviceType: 'android' | 'ios' | null) => {
    let dpi;
    if (deviceType === 'ios') {
      dpi = Math.floor(Math.random() * (450 - 72 + 1)) + 72;
    } else {
      dpi = Math.floor(Math.random() * 400) + 400;
    }
    return {
      general: Math.floor(Math.random() * 100) + 100,
      puntoRojo: Math.floor(Math.random() * 100) + 100,
      mira2x: Math.floor(Math.random() * 100) + 100,
      mira4x: Math.floor(Math.random() * 100) + 100,
      francotirador: Math.floor(Math.random() * 100) + 100,
      dpi: dpi,
      botonDisparo: Math.floor(Math.random() * 20) + 30,
    };
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setAiProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setGeneratedSettings(generateRandomSettings(device));
        setIsGenerating(false);
        setStep(2);
      }
    }, 100);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inicio':
        return (
          <div className="flex flex-col gap-6 p-6 pb-24">
            {step === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 items-center text-center mt-12">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-black tracking-tighter text-white">POWER XIT</h1>
                  <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Sensitivity Engine</p>
                </div>
                
                <div className="w-full max-w-md flex flex-col gap-6">
                  <h2 className="text-xl font-bold text-white">SELECCIONA TU EQUIPO</h2>
                  <p className="text-zinc-500 text-xs -mt-4">OPTIMIZAREMOS SEGÚN TU HARDWARE</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setDevice('android')}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${device === 'android' ? 'border-red-600 bg-red-600/10' : 'border-zinc-800 bg-zinc-900/50'}`}
                    >
                      <Smartphone className={device === 'android' ? 'text-red-600' : 'text-zinc-500'} size={32} />
                      <span className="font-bold text-sm">ANDROID</span>
                    </button>
                    <button 
                      onClick={() => setDevice('ios')}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${device === 'ios' ? 'border-red-600 bg-red-600/10' : 'border-zinc-800 bg-zinc-900/50'}`}
                    >
                      <Apple className={device === 'ios' ? 'text-red-600' : 'text-zinc-500'} size={32} />
                      <span className="font-bold text-sm">IOS</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                    <input 
                      type="text" 
                      placeholder="Ej: Galaxy S23, iPhone 15..." 
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                  
                  <Button onClick={() => setStep(1)} className="w-full">
                    CONTINUAR <ChevronRight size={20} />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6 mt-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setStep(0)} className="p-2 rounded-lg bg-zinc-900 text-zinc-400"><ArrowLeft size={20} /></button>
                  <h2 className="text-2xl font-black text-white italic">AJUSTA TU ESTILO</h2>
                </div>
                
                <div className="flex flex-col gap-4">
                  {['Incluir DPI', 'Botón de disparo', 'Sensibilidad alta', 'Sensibilidad baja'].map((option) => (
                    <label key={option} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 cursor-pointer hover:border-red-600/50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-white">{option}</span>
                        <span className="text-zinc-500 text-xs">Optimización avanzada para tu dispositivo</span>
                      </div>
                      <input type="checkbox" className="w-6 h-6 rounded-lg accent-red-600" />
                    </label>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button variant="secondary" onClick={() => setStep(0)}>ATRÁS</Button>
                  <Button onClick={handleGenerate}>GENERAR</Button>
                </div>
              </motion.div>
            )}

            {isGenerating && (
              <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-full max-w-xs flex flex-col gap-6">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                    <motion.div 
                      className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white">
                      {aiProgress}%
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-white">PROCESANDO</h3>
                    <p className="text-zinc-500 text-sm">Calculando los mejores valores para {model || 'tu dispositivo'}...</p>
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && generatedSettings && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-6 mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white italic">TU SENSIBILIDAD</h2>
                  <div className="text-xs font-bold text-red-600 bg-red-600/10 px-3 py-1 rounded-full">{device?.toUpperCase()} - {model || 'GENÉRICO'}</div>
                </div>
                
                <Card className="flex flex-col gap-4">
                  {Object.entries(generatedSettings).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-black text-white">{value}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(((value as number) / 200) * 100, 100)}%` }}
                          className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                        />
                      </div>
                    </div>
                  ))}
                </Card>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" className="w-full" onClick={handleCopySettings}>
                    <Copy size={18} /> {copyButtonText}
                  </Button>
                  <Button className="w-full" onClick={() => setStep(0)}>
                    <RefreshCw size={18} /> NUEVA
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        );
      
      case 'ia':
        return (
          <div className="flex flex-col gap-6 p-6 pb-24">
            <div className="flex flex-col gap-1 mt-8">
              <h1 className="text-3xl font-black text-white italic">.Power Xit IA</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Generación Inteligente</p>
            </div>
            
            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-red-600"
                animate={{ width: `${(aiStep / 5) * 100}%` }}
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={aiStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                {aiStep === 0 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">¿Qué versión de Free Fire usas?</h3>
                    {['Free Fire MAX', 'Free Fire Clásico', 'Free Fire Advance'].map((opt) => (
                      <button key={opt} onClick={() => setAiStep(1)} className="w-full p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left font-bold hover:border-red-600 transition-colors">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {aiStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">¿Tu móvil se laguea durante las partidas?</h3>
                    {['Nunca', 'A veces', 'Frecuentemente', 'Siempre'].map((opt) => (
                      <button key={opt} onClick={() => setAiStep(2)} className="w-full p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left font-bold hover:border-red-600 transition-colors">
                        {opt}
                      </button>
                    ))}
                    <Button variant="secondary" onClick={() => setAiStep(0)}>Anterior</Button>
                  </div>
                )}
                {aiStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Paso 3 de 5: Configuración de HUD</h3>
                    <p className="text-zinc-400 text-sm">Selecciona tu estilo de juego actual:</p>
                    {['HUD 2 dedos', 'HUD 3 dedos', 'HUD 4 dedos', 'HUD 5 dedos'].map((opt) => (
                      <button key={opt} onClick={() => setAiStep(3)} className="w-full p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left font-bold hover:border-red-600 transition-colors">
                        {opt}
                      </button>
                    ))}
                    <Button variant="secondary" onClick={() => setAiStep(1)}>Anterior</Button>
                  </div>
                )}
                {aiStep === 3 && (
                   <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-white">Paso 4 de 5</h3>
                    <p className="text-zinc-400">Configurando parámetros de IA finales...</p>
                    <Button onClick={() => setAiStep(4)}>SIGUIENTE</Button>
                    <Button variant="secondary" onClick={() => setAiStep(2)}>Anterior</Button>
                  </div>
                )}
                {aiStep === 4 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold text-white">Paso 5 de 5: Tu Dispositivo</h3>
                      <p className="text-zinc-400 text-sm">Ingresa los datos de tu equipo para la generación final.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setDevice('android')}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${device === 'android' ? 'border-red-600 bg-red-600/10' : 'border-zinc-800 bg-zinc-900/50'}`}
                      >
                        <Smartphone className={device === 'android' ? 'text-red-600' : 'text-zinc-500'} size={24} />
                        <span className="font-bold text-xs">ANDROID</span>
                      </button>
                      <button 
                        onClick={() => setDevice('ios')}
                        className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${device === 'ios' ? 'border-red-600 bg-red-600/10' : 'border-zinc-800 bg-zinc-900/50'}`}
                      >
                        <Apple className={device === 'ios' ? 'text-red-600' : 'text-zinc-500'} size={24} />
                        <span className="font-bold text-xs">IOS</span>
                      </button>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                      <input 
                        type="text" 
                        placeholder="Ej: Galaxy S23, iPhone 15..." 
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
                      />
                    </div>
                    
                    <Button onClick={() => setAiStep(5)} className="w-full">
                      GENERAR SENSIBILIDAD
                    </Button>
                    <Button variant="secondary" onClick={() => setAiStep(3)}>Anterior</Button>
                  </div>
                )}
                {aiStep === 5 && (
                  <div className="flex flex-col gap-6 items-center text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center text-red-600">
                      <Sparkles size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-white">¡IA LISTA!</h3>
                    <p className="text-zinc-400">Hemos analizado tu perfil de juego y hardware ({model || 'Genérico'}).</p>
                    <Button onClick={() => { setAiStep(0); setActiveTab('inicio'); setStep(2); setGeneratedSettings(generateRandomSettings(device)); }} className="w-full">VER RESULTADOS</Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        );

      case 'chat':
        if (!userProfile) {
          return (
            <div className="flex flex-col h-full p-6 pb-24 items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {!isGeneratingProfile ? (
                  <motion.div 
                    key="setup"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col gap-8 w-full max-w-sm items-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600">
                      <Camera size={32} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">BIENVENIDO</h2>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">CONFIGURA TU PERFIL PARA CONTINUAR</p>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                        <input 
                          type="text" 
                          placeholder="Tu nombre de usuario" 
                          value={profileUsername}
                          onChange={(e) => setProfileUsername(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-12 pr-6 text-white focus:outline-none focus:border-red-600 transition-all font-bold"
                        />
                      </div>
                      <Button onClick={handleProfileSetup} className="w-full py-5">
                        CONTINUAR <ChevronRight size={20} />
                      </Button>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">La IA generará avatar y descripción automáticamente</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-4 border-zinc-900 rounded-full" />
                      <motion.div 
                        className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-red-600" size={32} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-black text-white italic uppercase">.Power Xit IA</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Generación Inteligente</p>
                    </div>
                    <p className="text-zinc-400 text-sm animate-pulse">Creando tu identidad digital...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <div className="flex flex-col h-screen p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-600/20">
                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-white italic uppercase">{userProfile.username}</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nivel 1 - Novato</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 items-center justify-center flex-1 text-center">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 max-w-sm">
                <p className="text-zinc-300 text-sm leading-relaxed italic">"{userProfile.bio}"</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <h3 className="text-white font-bold">Chat Global</h3>
                <p className="text-zinc-500 text-xs">Conéctate con otros jugadores de Power Xit</p>
              </div>

              <Button variant="outline" className="px-8">ENTRAR AL CHAT</Button>
            </div>
          </div>
        );

      case 'perfil':
        if (!userProfile) {
          return (
            <div className="flex flex-col h-full p-6 pb-24 items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {!isGeneratingProfile ? (
                  <motion.div 
                    key="setup-perfil"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col gap-8 w-full max-w-sm items-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600">
                      <Camera size={32} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">BIENVENIDO</h2>
                      <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">CONFIGURA TU PERFIL PARA CONTINUAR</p>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                        <input 
                          type="text" 
                          placeholder="Tu nombre de usuario" 
                          value={profileUsername}
                          onChange={(e) => setProfileUsername(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-12 pr-6 text-white focus:outline-none focus:border-red-600 transition-all font-bold"
                        />
                      </div>
                      <Button onClick={handleProfileSetup} className="w-full py-5">
                        CONTINUAR <ChevronRight size={20} />
                      </Button>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">La IA generará avatar y descripción automáticamente</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="generating-perfil"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-4 border-zinc-900 rounded-full" />
                      <motion.div 
                        className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-red-600" size={32} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-black text-white italic uppercase">.Power Xit IA</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Generación Inteligente</p>
                    </div>
                    <p className="text-zinc-400 text-sm animate-pulse">Creando tu identidad digital...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <div className="flex flex-col h-screen p-6 pb-24">
            <div className="mt-12 flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                  <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg">
                  <Trophy size={16} />
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">{userProfile.username}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-600 bg-red-600/10 px-3 py-1 rounded-full uppercase tracking-widest">PRO PLAYER</span>
                  <span className="text-xs font-bold text-zinc-500">NIVEL 1</span>
                </div>
              </div>

              <Card className="w-full max-w-sm">
                <p className="text-zinc-300 text-sm leading-relaxed italic text-center">"{userProfile.bio}"</p>
              </Card>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Partidas</span>
                  <span className="text-xl font-black text-white">0</span>
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Kills</span>
                  <span className="text-xl font-black text-white">0</span>
                </div>
              </div>

              <Button variant="secondary" className="w-full max-w-sm" onClick={() => setUserProfile(null)}>
                CERRAR SESIÓN
              </Button>
            </div>
          </div>
        );

      case 'config':
        return (
          <div className="flex flex-col gap-6 p-6 pb-24 h-full">
            <div className="flex flex-col gap-1 mt-8">
              <h1 className="text-3xl font-black text-white italic">Configuración</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">IA técnica - 15 restantes</p>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <Zap size={20} />, label: 'Sensibilidad', color: 'text-red-500' },
                { icon: <Cpu size={20} />, label: 'FPS & Lag', color: 'text-orange-500' },
                { icon: <Wifi size={20} />, label: 'Ping & Red', color: 'text-blue-500' },
                { icon: <Monitor size={20} />, label: 'DPI', color: 'text-purple-500' },
                { icon: <Layers size={20} />, label: 'Apps', color: 'text-green-500' },
                { icon: <Trash2 size={20} />, label: 'Caché', color: 'text-zinc-500' },
                { icon: <Battery size={20} />, label: 'Batería', color: 'text-yellow-500' },
                { icon: <Monitor size={20} />, label: 'Gráficos', color: 'text-cyan-500' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => setConfigInput(`Dame consejos sobre ${item.label}`)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-white/10 transition-all active:scale-95"
                >
                  <div className={`${item.color}`}>{item.icon}</div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="flex flex-col gap-4 flex-1 overflow-hidden">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex-1 overflow-y-auto flex flex-col gap-4 scrollbar-hide">
                {configChatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-red-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isConfigChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 text-zinc-400 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-widest">Analizando...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={configInput}
                  onChange={(e) => setConfigInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendConfigMessage()}
                  placeholder="Pregunta sobre configuración..." 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-6 pr-14 text-white focus:outline-none focus:border-red-600"
                />
                <button 
                  onClick={handleSendConfigMessage}
                  disabled={isConfigChatLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-red-600 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="flex flex-col gap-8 p-6 pb-24">
            <div className="flex flex-col gap-1 mt-8">
              <h1 className="text-3xl font-black text-white italic uppercase">Power Xit</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Generador Profesional - V2.1.0</p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">LEGAL</span>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: <FileText size={18} />, label: 'Términos y Condiciones' },
                    { icon: <Shield size={18} />, label: 'Política de Privacidad' },
                    { icon: <Layers size={18} />, label: 'Licencias' },
                  ].map((item, i) => (
                    <button key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 transition-all">
                      <div className="flex items-center gap-3 text-zinc-300">
                        {item.icon}
                        <span className="font-bold text-sm">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-zinc-600" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">COMPAÑÍA</span>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: <Info size={18} />, label: 'Acerca de Power Xit' },
                    { icon: <User size={18} />, label: 'Desarrollador' },
                  ].map((item, i) => (
                    <button key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 transition-all">
                      <div className="flex items-center gap-3 text-zinc-300">
                        {item.icon}
                        <span className="font-bold text-sm">{item.label}</span>
                      </div>
                      <ChevronRight size={16} className="text-zinc-600" />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">PRODUCTO</span>
                <div className="flex flex-col gap-2">
                  <button className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/50 transition-all">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <RefreshCw size={18} />
                      <span className="font-bold text-sm">Actualizaciones</span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">CONTACTO</span>
                <button className="text-red-600 font-bold text-sm hover:underline flex items-center gap-2">
                  @powerxit.ps <ExternalLink size={14} />
                </button>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">© 2026 Power Xit Corporation. Todos los derechos reservados.</p>
              </div>
            </div>
          </div>
        );

      case 'pro':
        return (
          <div className="flex flex-col gap-6 p-6 pb-24">
            <div className="flex flex-col gap-1 mt-8">
              <h1 className="text-3xl font-black text-white italic uppercase">L-gan</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Jugadores Profesionales</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                placeholder="Buscar jugador..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-red-600"
              />
            </div>
            
            <div className="flex flex-col gap-4">
              {PRO_PLAYERS.map((player, i) => (
                <Card key={i} className="flex flex-col gap-4 overflow-hidden border-l-4 border-l-red-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-xl text-red-600">
                        {player.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-black text-white text-lg">{player.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase">
                          <span>@{player.region}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span>{player.followers}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-zinc-500"><ChevronRight size={20} /></button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-red-600/10 text-red-600 text-[10px] font-black uppercase tracking-wider">{player.role}</span>
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-wider">{player.team}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase">General</span>
                      <span className="font-black text-white">{player.settings.general}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase">Punto Rojo</span>
                      <span className="font-black text-white">{player.settings.puntoRojo}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase">Mira 2x</span>
                      <span className="font-black text-white">{player.settings.mira2x}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase">Mira 4x</span>
                      <span className="font-black text-white">{player.settings.mira4x}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase">Francotirador</span>
                      <span className="font-black text-white">{player.settings.francotirador}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-zinc-600 uppercase">DPI</span>
                      <span className="font-black text-white">{player.settings.dpi}</span>
                    </div>
                  </div>
                  
                  <Button variant="secondary" className="w-full py-2 text-xs">
                    <Copy size={14} /> Copiar Sensibilidad
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15),transparent_70%)]" />
        <img 
          src="https://picsum.photos/seed/warrior/1920/1080?blur=10" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20 scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-lg mx-auto min-h-screen">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 px-2 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-1">
          {[
            { id: 'inicio', icon: <Home size={20} />, label: 'Inicio' },
            { id: 'ia', icon: <Sparkles size={20} />, label: 'IA' },
            { id: 'chat', icon: <MessageSquare size={20} />, label: 'Chat' },
            { id: 'perfil', icon: <User size={20} />, label: 'Perfil' },
            { id: 'config', icon: <Settings size={20} />, label: 'Config' },
            { id: 'info', icon: <Info size={20} />, label: 'Info' },
            { id: 'pro', icon: <Trophy size={20} />, label: 'L-gan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex flex-col items-center gap-1.5 flex-1 py-1 transition-all ${activeTab === tab.id ? 'text-red-600' : 'text-zinc-600'}`}
            >
              <div className={`transition-transform ${activeTab === tab.id ? 'scale-110' : 'scale-100'}`}>
                {tab.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTab === tab.id ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div layoutId="nav-indicator" className="w-1 h-1 rounded-full bg-red-600 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
