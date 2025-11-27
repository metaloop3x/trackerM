import React, { useState, useEffect } from 'react';
import { GlassButton, GlassCard, GlassInput, GlassSelect } from './GlassUI';
import { Category, CATEGORY_GROUPS, ScanResult, Transaction, Project } from '../types';
import { Check, X, Tag, Folder } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AddTransactionProps {
  initialData?: ScanResult | null;
  imagePreview?: string | null;
  projects: Project[]; // Added prop
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ initialData, imagePreview, projects, onSave, onCancel }) => {
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [note, setNote] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [projectId, setProjectId] = useState<string>(''); // Project Selection State

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.total.toString());
      setMerchant(initialData.merchant);
      setDate(initialData.date);
      setCategory(initialData.category);
      if (initialData.items && initialData.items.length > 0) {
        setNote(initialData.items.map(i => `${i.quantity || 1}x ${i.name}`).join(', '));
      }
      if (initialData.tags && initialData.tags.length > 0) {
        setTagsStr(initialData.tags.map(t => `#${t}`).join(' '));
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchant) return;

    // Process tags
    const tags = tagsStr
      .split(' ')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const newTransaction: Transaction = {
      id: uuidv4(),
      date,
      merchant,
      amount: parseFloat(amount),
      category,
      note,
      tags,
      projectId: projectId || undefined,
      receiptImage: imagePreview || undefined,
      items: initialData?.items || []
    };

    onSave(newTransaction);
  };

  return (
    <div className="animate-in slide-in-from-bottom duration-300 h-full pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {initialData ? 'Verify Details' : 'New Transaction'}
        </h2>
        <button onClick={onCancel} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {imagePreview && (
          <div className="w-full h-48 rounded-xl overflow-hidden relative border border-white/20">
             <img src={imagePreview} alt="Receipt" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <span className="text-white text-sm font-medium">Scanned Receipt</span>
             </div>
          </div>
        )}

        <GlassCard>
           <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-1 block">Amount</label>
              <GlassInput 
                type="number" 
                step="0.01"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
                className="text-2xl font-bold font-mono"
                required
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Merchant</label>
              <GlassInput 
                type="text" 
                value={merchant} 
                onChange={(e) => setMerchant(e.target.value)} 
                placeholder="Starbucks, Apple, etc."
                required
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Date</label>
              <GlassInput 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Category</label>
              <GlassSelect value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {Object.entries(CATEGORY_GROUPS).map(([group, categories]) => (
                  <optgroup key={group} label={group} className="text-black bg-gray-200">
                    {categories.map((c) => (
                       <option key={c} value={c} className="text-black bg-white">{c}</option>
                    ))}
                  </optgroup>
                ))}
              </GlassSelect>
            </div>
            
            {/* Project Selector */}
            <div>
              <label className="text-white/70 text-sm mb-1 block">Project (Optional)</label>
              <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                    <Folder size={16} />
                 </div>
                 <GlassSelect 
                    value={projectId} 
                    onChange={(e) => setProjectId(e.target.value)}
                    className="pl-10"
                 >
                    <option value="" className="text-black">No Project</option>
                    {projects.filter(p => p.status === 'active').map(p => (
                        <option key={p.id} value={p.id} className="text-black">{p.name}</option>
                    ))}
                 </GlassSelect>
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Hashtags</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  <Tag size={16} />
                </div>
                <GlassInput 
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="#Creative #Cloud"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-1 block">Notes / Items</label>
              <GlassInput 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Details..."
              />
            </div>
           </div>
        </GlassCard>

        <GlassButton type="submit" className="w-full flex items-center justify-center gap-2">
          <Check size={20} />
          Save Transaction
        </GlassButton>
      </form>
    </div>
  );
};

export default AddTransaction;
