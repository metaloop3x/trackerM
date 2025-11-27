import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { GlassButton, GlassCard } from './GlassUI';
import { analyzeReceipt, fileToGenerativePart } from '../services/geminiService';
import { ScanResult, Category } from '../types';

interface ScannerProps {
  onScanComplete: (result: ScanResult, imagePreview: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Convert to Base64 for Preview & AI
      const base64Data = await fileToGenerativePart(file);
      const mimeType = file.type;
      
      // 2. Send to Gemini
      const result = await analyzeReceipt(base64Data, mimeType);
      
      // 3. Complete
      onScanComplete(result, `data:${mimeType};base64,${base64Data}`);
    } catch (err) {
      setError("Failed to analyze receipt. Please try again or enter manually.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Scan Receipt</h2>
        <p className="text-white/60">Upload or take a photo of your bill for AI analysis.</p>
      </div>

      <GlassCard className="w-full max-w-md p-8 flex flex-col items-center gap-6 border-dashed border-2 border-white/30">
        
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-medium animate-pulse">AI is reading your bill...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
              >
                <div className="p-4 rounded-full bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                  <Camera size={32} />
                </div>
                <span className="text-white font-medium">Camera</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
              >
                <div className="p-4 rounded-full bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <span className="text-white font-medium">Upload</span>
              </button>
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
          </>
        )}
      </GlassCard>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl backdrop-blur-md flex items-center gap-2">
          <X size={18} />
          {error}
        </div>
      )}

      <GlassButton variant="secondary" onClick={onCancel} className="w-full max-w-xs">
        Cancel
      </GlassButton>
    </div>
  );
};

export default Scanner;
