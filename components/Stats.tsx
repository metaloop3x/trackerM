import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Transaction, Category, Budget, INCOME_CATEGORIES } from '../types';
import { GlassCard } from './GlassUI';

interface StatsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const COLORS = [
  '#60A5FA', // Blue
  '#F472B6', // Pink
  '#A78BFA', // Purple
  '#34D399', // Emerald
  '#FBBF24', // Amber
  '#F87171', // Red
  '#A3E635', // Lime
  '#818CF8', // Indigo
  '#FB7185', // Rose
];

const Stats: React.FC<StatsProps> = ({ transactions, budgets }) => {
  
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.forEach(t => {
      // Exclude income from expense pie chart
      if (INCOME_CATEGORIES.includes(t.category)) return;
      
      if (!data[t.category]) data[t.category] = 0;
      data[t.category] += t.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by highest spend
  }, [transactions]);

  const weeklyData = useMemo(() => {
    // Simple last 7 days logic
    const data: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      data[dateStr] = 0;
    }

    transactions.forEach(t => {
       if (INCOME_CATEGORIES.includes(t.category)) return;
       const dateStr = t.date.split('T')[0];
       if (data[dateStr] !== undefined) {
         data[dateStr] += t.amount;
       }
    });

    return Object.entries(data).map(([date, amount]) => ({
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      amount
    }));
  }, [transactions]);

  const totalSpent = transactions
    .filter(t => !INCOME_CATEGORIES.includes(t.category))
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalIncome = transactions
    .filter(t => INCOME_CATEGORIES.includes(t.category))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);

  const formatCurrency = (val: number) => `$${val.toFixed(2)}`;

  return (
    <div className="space-y-6 pb-20">
       <h2 className="text-2xl font-bold text-white mb-4">Financial Insights</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard>
            <p className="text-white/60 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalSpent)}</p>
        </GlassCard>
        <GlassCard className="border-green-500/30 bg-green-500/10">
            <p className="text-green-200/60 text-sm">Total Income</p>
            <p className="text-2xl font-bold text-green-300 mt-1">{formatCurrency(totalIncome)}</p>
        </GlassCard>
      </div>

      {/* Category Distribution */}
      <GlassCard className="h-96">
        <h3 className="text-white font-semibold mb-4">Expenses Breakdown</h3>
        {categoryData.length > 0 ? (
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
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
            <div className="h-full flex items-center justify-center text-white/40">No expenses yet</div>
        )}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {categoryData.slice(0, 5).map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs text-white/70">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[index % COLORS.length]}} />
                    <span>{entry.name}</span>
                </div>
            ))}
        </div>
      </GlassCard>

      {/* Weekly Activity */}
      <GlassCard className="h-64">
        <h3 className="text-white font-semibold mb-4">Weekly Spending</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)'}} />
            <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.1)'}}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: 'none', color: '#fff' }}
            />
            <Bar dataKey="amount" fill="#60A5FA" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Budget Progress */}
      <GlassCard>
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Budget Status</h3>
              <span className="text-xs text-white/50">{formatCurrency(totalBudget)} Total</span>
          </div>
          
          <div className="space-y-5">
              {budgets.map(b => {
                  const spent = categoryData.find(c => c.name === b.category)?.value || 0;
                  const percentage = Math.min(100, (spent / b.limit) * 100);
                  const isOver = spent > b.limit;

                  return (
                      <div key={b.category}>
                          <div className="flex justify-between text-sm text-white mb-1">
                              <span>{b.category}</span>
                              <span className={isOver ? 'text-red-400' : 'text-white/60'}>
                                  {formatCurrency(spent)} / {formatCurrency(b.limit)}
                              </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${percentage}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-green-400'}`}
                              />
                          </div>
                      </div>
                  )
              })}
              {budgets.length === 0 && <p className="text-white/40 text-sm">No specific budgets set.</p>}
          </div>
      </GlassCard>
    </div>
  );
};

export default Stats;