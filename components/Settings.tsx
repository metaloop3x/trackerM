import React, { useState } from 'react';
import { Budget, Category, CATEGORY_GROUPS } from '../types';
import { GlassCard, GlassButton, GlassInput } from './GlassUI';
import { Save, Trash2, Database, ChevronDown, ChevronRight } from 'lucide-react';

interface SettingsProps {
  budgets: Budget[];
  onUpdateBudget: (category: Category, limit: number) => void;
  onClearData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ budgets, onUpdateBudget, onClearData }) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  const getBudget = (cat: Category) => {
    return budgets.find(b => b.category === cat)?.limit || 0;
  };

  return (
    <div className="pb-24 animate-in fade-in duration-300 space-y-8">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

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

      {/* Data Management */}
      <section>
          <h3 className="text-white/80 font-semibold mb-4 border-b border-white/10 pb-2">Data & Storage</h3>
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
      </section>
      
      <div className="text-center text-white/20 text-xs">
          v1.0.2 • GlassBooks AI
      </div>
    </div>
  );
};

export default Settings;
