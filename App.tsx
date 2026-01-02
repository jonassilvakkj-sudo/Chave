
import React, { useState, useCallback, useRef } from 'react';
import { ExportFormat, ImageState } from './types';
import { transformImage } from './utils/imageProcessing';
import { analyzeImage } from './utils/aiService';
import Header from './components/Header';

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    file: null,
    previewUrl: null,
    originalWidth: 0,
    originalHeight: 0,
    width: 0,
    height: 0,
    aspectRatio: 1,
    format: ExportFormat.PNG,
    maintainAspectRatio: true,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        setState({
          file,
          previewUrl: url,
          originalWidth: img.width,
          originalHeight: img.height,
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          format: ExportFormat.PNG,
          maintainAspectRatio: true,
        });
        setDownloadUrl(null);
        setAiSummary(null);
        
        // Inicia análise automática por IA
        setIsAnalyzing(true);
        try {
          const base64 = await fileToBase64(file);
          const summary = await analyzeImage(base64, file.type);
          setAiSummary(summary);
        } catch (err) {
          setAiSummary("Erro ao processar análise inteligente.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      img.src = url;
    }
  };

  const updateWidth = (w: number) => {
    setState(prev => ({
      ...prev,
      width: w,
      height: prev.maintainAspectRatio ? Math.round(w / prev.aspectRatio) : prev.height
    }));
  };

  const updateHeight = (h: number) => {
    setState(prev => ({
      ...prev,
      height: h,
      width: prev.maintainAspectRatio ? Math.round(h * prev.aspectRatio) : prev.width
    }));
  };

  const handleTransform = async () => {
    if (!state.previewUrl || !state.file) return;

    setIsProcessing(true);
    try {
      const result = await transformImage(
        state.previewUrl,
        state.width,
        state.height,
        state.format,
        state.file.name
      );
      setDownloadUrl(result.url);
      setDownloadName(result.name);
    } catch (error) {
      console.error("Transformation failed", error);
      alert("Erro ao processar imagem.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setState({
      file: null,
      previewUrl: null,
      originalWidth: 0,
      originalHeight: 0,
      width: 0,
      height: 0,
      aspectRatio: 1,
      format: ExportFormat.PNG,
      maintainAspectRatio: true,
    });
    setDownloadUrl(null);
    setAiSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-zinc-700">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent">
            PRECISÃO ABSOLUTA.
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
            Conversão profissional de formatos com análise neural integrada. 
            Sem restrições, sem falhas, processamento instantâneo.
          </p>
        </div>

        {!state.previewUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-zinc-800 hover:border-zinc-500 rounded-[2.5rem] p-12 md:p-32 flex flex-col items-center justify-center cursor-pointer transition-all bg-zinc-950/30 hover:bg-zinc-900/40"
          >
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl">
              <svg className="w-10 h-10 text-zinc-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold mb-3">Arraste sua obra-prima</p>
            <p className="text-zinc-500 font-medium">PNG, JPG, WEBP até 50MB</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden" 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Esquerda: Preview e IA */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-4 h-[500px] flex items-center justify-center relative group overflow-hidden">
                <img 
                  src={state.previewUrl} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                   <button onClick={handleReset} className="bg-black/60 hover:bg-red-500/80 backdrop-blur-md p-3 rounded-full transition-all">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
              </div>

              {/* Box de IA Resumo */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2rem] p-8 overflow-hidden relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse delay-150"></div>
                  </div>
                  <h3 className="text-sm font-black tracking-[0.2em] text-zinc-400 uppercase">Resumo Inteligente Automático</h3>
                </div>
                
                {isAnalyzing ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-zinc-800/50 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-zinc-800/50 rounded-full w-full animate-pulse"></div>
                    <div className="h-4 bg-zinc-800/50 rounded-full w-2/3 animate-pulse"></div>
                  </div>
                ) : aiSummary ? (
                  <div className="text-zinc-300 leading-relaxed font-mono text-sm whitespace-pre-wrap max-h-[250px] overflow-y-auto pr-4 scrollbar-thin">
                    {aiSummary}
                  </div>
                ) : (
                  <p className="text-zinc-600 italic">Aguardando análise de conteúdo...</p>
                )}
              </div>
            </div>

            {/* Direita: Controles */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 space-y-10 sticky top-24">
                <section>
                  <h4 className="text-xs font-black text-zinc-600 mb-6 uppercase tracking-widest">Ajustes de Escala</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 ml-1">LARGURA</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={state.width}
                          onChange={(e) => updateWidth(parseInt(e.target.value) || 0)}
                          className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-white/10 outline-none transition-all text-xl font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-bold">PX</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 ml-1">ALTURA</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={state.height}
                          onChange={(e) => updateHeight(parseInt(e.target.value) || 0)}
                          className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-white/10 outline-none transition-all text-xl font-bold"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-bold">PX</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between bg-black/50 p-4 rounded-2xl border border-zinc-900">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">Cadeado de Proporção</span>
                      <span className="text-[10px] text-zinc-500 uppercase">Evita distorção da imagem</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={state.maintainAspectRatio}
                        onChange={(e) => setState(prev => ({ ...prev, maintainAspectRatio: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-100"></div>
                    </label>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-black text-zinc-600 mb-6 uppercase tracking-widest">Formato Final</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(ExportFormat).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setState(prev => ({ ...prev, format: value as ExportFormat }));
                          setDownloadUrl(null); // Reset download if format changes
                        }}
                        className={`py-4 rounded-2xl text-xs font-black tracking-widest transition-all border ${
                          state.format === value 
                          ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                          : 'bg-black text-zinc-500 border-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="pt-6 space-y-4">
                  {downloadUrl ? (
                    <div className="animate-in zoom-in-95 duration-300">
                      <a 
                        href={downloadUrl} 
                        download={downloadName}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-3xl text-center text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        OBTER ARQUIVO .{state.format.split('/')[1].toUpperCase()}
                      </a>
                      <button 
                        onClick={() => setDownloadUrl(null)}
                        className="w-full mt-3 text-zinc-600 hover:text-white text-xs font-bold py-2 transition-colors"
                      >
                        Gerar nova versão
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleTransform}
                      disabled={isProcessing}
                      className="w-full bg-zinc-100 hover:bg-white text-black font-black py-5 rounded-3xl text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <div className="w-6 h-6 border-[3px] border-black border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          PROCESSAR AGORA
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
                    Processado 100% no cliente • Sem limites
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-32">
          <InfoCard title="IA Vision" desc="Resumo técnico automático e sem restrições de cada upload." />
          <InfoCard title="Raw Output" desc="Conversão de bits direta no canvas para máxima fidelidade." />
          <InfoCard title="No Cloud" desc="Segurança absoluta. Seus dados nunca tocam a nuvem." />
          <InfoCard title="High Performance" desc="Otimizado para resoluções 4K e formatos pesados." />
        </div>
      </main>

      <footer className="border-t border-zinc-900/50 py-16 text-center">
         <div className="flex items-center justify-center gap-3 mb-6 opacity-30">
            <div className="w-12 h-[1px] bg-white"></div>
            <div className="w-2 h-2 rounded-full border border-white"></div>
            <div className="w-12 h-[1px] bg-white"></div>
         </div>
         <p className="text-zinc-600 text-xs font-black tracking-widest">DARKTRANSFORM STUDIO v2.0 • AI ENABLED</p>
      </footer>
    </div>
  );
};

const InfoCard = ({ title, desc }: { title: string; desc: string }) => (
  <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
    <h5 className="text-zinc-100 font-black text-sm mb-2 uppercase tracking-tight">{title}</h5>
    <p className="text-zinc-600 text-xs leading-relaxed font-medium">{desc}</p>
  </div>
);

export default App;
