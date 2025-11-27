
import React, { useState, useRef } from 'react';
import { Budget, Category, CATEGORY_GROUPS } from '../types';
import { GlassCard, GlassButton, GlassInput } from './GlassUI';
import { Trash2, Database, ChevronDown, ChevronRight, LogOut, Lock, Download, Upload, CheckCircle } from 'lucide-react';

interface SettingsProps {
  budgets: Budget[];
  onUpdateBudget: (category: Category, limit: number) => void;
  onClearData: () => void;
  onLogout: () => void;
  onExportData: () => void;
  onImportData: (file: File) => Promise<boolean>;
}

const Settings: React.FC<SettingsProps> = ({ budgets, onUpdateBudget, onClearData, onLogout, onExportData, onImportData }) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  const getBudget = (cat: Category) => {
    return budgets.find(b => b.category === cat)?.limit || 0;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const success = await onImportData(file);
        if (success) {
            setImportStatus('success');
            setTimeout(() => setImportStatus('idle'), 3000);
        } else {
            setImportStatus('error');
        }
    } catch (e) {
        setImportStatus('error');
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="pb-24 animate-in fade-in duration-300 space-y-8">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      {/* Backup & Restore */}
      <section>
          <h3 className="text-white/80 font-semibold mb-4 border-b border-white/10 pb-2">Data Management</h3>
          <div className="grid grid-cols-2 gap-4">
              <GlassCard className="flex flex-col items-center gap-3 !p-6 cursor-pointer hover:bg-white/20" onClick={onExportData}>
                  <div className="p-3 bg-blue-500/20 text-blue-300 rounded-full">
                      <Download size={24} />
                  </div>
                  <span className="font-medium text-white">Backup Data</span>
                  <span className="text-[10px] text-white/50 text-center">Download JSON file</span>
              </GlassCard>

              <GlassCard className="flex flex-col items-center gap-3 !p-6 cursor-pointer hover:bg-white/20" onClick={() => fileInputRef.current?.click()}>
                  <div className={`p-3 rounded-full transition-colors ${importStatus === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-purple-500/20 text-purple-300'}`}>
                      {importStatus === 'success' ? <CheckCircle size={24} /> : <Upload size={24} />}
                  </div>
                  <span className="font-medium text-white">{importStatus === 'success' ? 'Restored!' : 'Restore Data'}</span>
                  <span className="text-[10px] text-white/50 text-center">Import JSON file</span>
                  <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".json" 
                      onChange={handleFileChange}
                  />
              </GlassCard>
          </div>
          {importStatus === 'error' && <p className="text-red-400 text-xs text-center mt-2">Invalid backup file.</p>}
      </section>

      {/* Budget Manager */}
      <section>
          <h3 className="text-white/80 font-semibold mb-4 border-b border-white/10 pb-2">Category Budgets</h3>
          <div className="space-y-3">
              {Object.entries(CATEGORY_GROUPS).map(([group, categories]) => {
                  if (group === "Income Classification") return null; 

                  const isExpanded = expandedGroup === group;
                  return (
                    <GlassCard key={group} className="!p-0 overflow-hidden">
                        <button 
                            onClick={() => toggleGroup(group)}
                            className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <span className="font-semibold text-white/90">{group}</span>
                            {isExpanded ? <ChevronDown size={18} className="text-white/60"/> : <ChevronRight size={18} className="text-white/60"/>}
                        </button>
                        
                        {isExpanded && (
                            <div className="p-4 space-y-4 bg-black/20">
                                {categories.map(cat => (
                                    <div key={cat} className="flex items-center gap-4">
                                        <label className="flex-1 text-sm text-white/70">{cat}</label>
                                        <div className="w-32 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                            <GlassInput 
                                                type="number"
                                                className="!py-1 !pl-6 !pr-2 text-right text-sm"
                                                value={getBudget(cat) || ''}
                                                onChange={(e) => onUpdateBudget(cat, Number(e.target.value))}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                  );
              })}
          </div>
      </section>

      {/* Security & Data */}
      <section>
          <h3 className="text-white/80 font-semibold mb-4 border-b border-white/10 pb-2">System</h3>
          <div className="space-y-4">
             {/* Logout */}
             <GlassCard className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/70">
                      <Lock size={20} />
                      <span>App Security</span>
                  </div>
                  <GlassButton variant="secondary" onClick={onLogout} className="!py-2 !px-4 text-sm">
                      <LogOut size={14} className="inline mr-2"/>
                      Lock App
                  </GlassButton>
              </GlassCard>

              {/* Data Reset */}
              <GlassCard className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-white/70">
                      <Database size={20} />
                      <span>Local Storage Data</span>
                  </div>
                  <p className="text-xs text-white/40">
                      Your data is stored locally on this device. Clearing data will remove all transactions and projects permanently.
                  </p>
                  <GlassButton variant="danger" onClick={() => {
                      if (confirm("Are you sure? This cannot be undone.")) {
                          onClearData();
                      }
                  }}>
                      <Trash2 size={16} className="inline mr-2"/>
                      Reset All Data
                  </GlassButton>
              </GlassCard>
          </div>
      </section>
      
      <div className="text-center text-white/20 text-xs">
          v1.0.4 • GlassBooks AI
      </div>
    </div>
  );
};

export default Settings;
