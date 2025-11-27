import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Transaction, Category, INCOME_CATEGORIES } from '../types';
import { GlassCard } from './GlassUI';

interface InsightsProps {
  transactions: Transaction[];
}

const COLORS = [
  '#60A5FA', '#F472B6', '#A78BFA', '#34D399', '#FBBF24', '#F87171', '#A3E635', '#818CF8'
];

const Insights: React.FC<InsightsProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'tags'>('category');

  // Filter out income for spending analysis
  const expenses = useMemo(() => transactions.filter(t => !INCOME_CATEGORIES.includes(t.category)), [transactions]);

  // --- Category Analysis ---
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // --- Hashtag Analysis ---
  const tagData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(t => {
      if (t.tags && t.tags.length > 0) {
        // Distribute amount evenly across tags if multiple? 
        // Or count full amount for each tag? Let's count full amount for tag visibility.
        // Actually, clearer to just sum up.
        t.tags.forEach(tag => {
            const normalized = tag.toLowerCase();
            data[normalized] = (data[normalized] || 0) + t.amount;
        });
      }
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name: `#${name}`, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 tags
  }, [expenses]);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-white">Insights</h2>
         <div className="flex bg-white/10 rounded-lg p-1">
             <button 
                onClick={() => setActiveTab('category')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'category' ? 'bg-white/20 text-white' : 'text-white/50'}`}
             >
                 Categories
             </button>
             <button 
                onClick={() => setActiveTab('tags')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'tags' ? 'bg-white/20 text-white' : 'text-white/50'}`}
             >
                 Hashtags
             </button>
         </div>
      </div>

      {activeTab === 'category' ? (
          <>
            <GlassCard className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: 'none', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    </PieChart>
                </ResponsiveContainer>
            </GlassCard>

            <div className="space-y-3">
                {categoryData.map((item, index) => (
                    <GlassCard key={item.name} className="!p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                            <span className="text-white font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-white font-mono font-bold">${item.value.toLocaleString()}</span>
                            <span className="text-xs text-white/50">{((item.value / totalSpent) * 100).toFixed(1)}%</span>
                        </div>
                    </GlassCard>
                ))}
            </div>
          </>
      ) : (
          <div className="space-y-4">
               <GlassCard className="h-64">
                    <h3 className="text-white/70 text-sm mb-4">Top Spending Tags</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tagData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fill: 'white', fontSize: 10}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px' }}/>
                            <Bar dataKey="value" fill="#818CF8" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
               </GlassCard>

               <div className="grid grid-cols-2 gap-3">
                   {tagData.map((tag) => (
                       <GlassCard key={tag.name} className="!p-3">
                           <p className="text-blue-300 text-sm font-semibold mb-1">{tag.name}</p>
                           <p className="text-white font-mono text-lg">${tag.value.toLocaleString()}</p>
                       </GlassCard>
                   ))}
               </div>
               
               {tagData.length === 0 && (
                   <div className="text-center py-10 text-white/40">
                       No hashtags found in expenses.
                   </div>
               )}
          </div>
      )}
    </div>
  );
};

export default Insights;