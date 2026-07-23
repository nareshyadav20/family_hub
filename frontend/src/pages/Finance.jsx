import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, ArrowUpRight, ArrowDownRight, Plus, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const accounts = [
  { name: 'Family Trust Fund', balance: '$4,250,000', change: '+2.3%', type: 'Trust', icon: PiggyBank, iconColor: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', up: true },
  { name: 'Investment Portfolio', balance: '$3,120,000', change: '+5.1%', type: 'Investment', icon: TrendingUp, iconColor: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', up: true },
  { name: 'Real Estate Holdings', balance: '$3,800,000', change: '+1.8%', type: 'Property', icon: Wallet, iconColor: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', up: true },
  { name: 'Operating Account', balance: '$530,000', change: '-0.5%', type: 'Checking', icon: CreditCard, iconColor: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', up: false },
];

const transactions = [
  { id: 1, desc: 'Property Tax — Springfield House', amount: '-$12,500', date: 'Jul 5, 2026', category: 'Tax', status: 'completed' },
  { id: 2, desc: 'Dividend — Apple Inc.', amount: '+$3,200', date: 'Jul 3, 2026', category: 'Dividend', status: 'completed' },
  { id: 3, desc: 'Family Reunion Catering Deposit', amount: '-$2,800', date: 'Jul 1, 2026', category: 'Events', status: 'pending' },
  { id: 4, desc: 'Rental Income — LA Property', amount: '+$4,500', date: 'Jun 30, 2026', category: 'Rental', status: 'completed' },
  { id: 5, desc: 'Insurance Premium — Q3', amount: '-$8,900', date: 'Jun 28, 2026', category: 'Insurance', status: 'completed' },
  { id: 6, desc: 'Dividend — Vanguard ETF', amount: '+$1,850', date: 'Jun 25, 2026', category: 'Dividend', status: 'completed' },
  { id: 7, desc: 'Education Fund — College Tuition', amount: '-$5,200', date: 'Jun 20, 2026', category: 'Education', status: 'completed' },
  { id: 8, desc: 'Trust Distribution — Q2', amount: '+$15,000', date: 'Jun 15, 2026', category: 'Trust', status: 'completed' },
];

const chartData = [
  { month: 'Jan', income: 22000, expense: 8000 },
  { month: 'Feb', income: 18000, expense: 12000 },
  { month: 'Mar', income: 25000, expense: 9000 },
  { month: 'Apr', income: 19000, expense: 14000 },
  { month: 'May', income: 28000, expense: 10000 },
  { month: 'Jun', income: 24000, expense: 11000 },
  { month: 'Jul', income: 21000, expense: 8000 },
];

export default function Finance() {
  const [txFilter, setTxFilter] = useState('all');

  const filteredTx = transactions.filter(tx =>
    txFilter === 'all' ? true : txFilter === 'income' ? tx.amount.startsWith('+') : tx.amount.startsWith('-')
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Finance</h1>
          <p className="text-slate-500 text-sm mt-1">
            Total Family Net Worth: <span className="font-bold text-emerald-600">$11,700,000</span>
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30">
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${acc.bg} flex items-center justify-center`}>
                <acc.icon size={22} className={acc.iconColor} />
              </div>
              <span className={`text-sm font-bold flex items-center gap-1 ${acc.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {acc.up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                {acc.change}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{acc.balance}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1.5">{acc.name}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500">{acc.type}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
            <div className="flex gap-2">
              {[['all', 'All'], ['income', 'Income'], ['expense', 'Expense']].map(([val, label]) => (
                <button key={val} onClick={() => setTxFilter(val)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${txFilter === val ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.amount.startsWith('+') ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                      {tx.amount.startsWith('+') ? <ArrowUpRight size={18} className="text-emerald-500" /> : <ArrowDownRight size={18} className="text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{tx.desc}</p>
                      <p className="text-[11px] text-slate-500">{tx.date} &middot; {tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{tx.amount}</p>
                    <span className={`text-[10px] font-bold ${tx.status === 'pending' ? 'text-amber-500' : 'text-slate-400'}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-5">Monthly Cash Flow</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v / 1000}k`} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            {[['#10B981', 'Income'], ['#EF4444', 'Expense']].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                {label}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
            {[['Total Income', '+$157,000', 'text-emerald-600'], ['Total Expense', '-$62,900', 'text-red-500']].map(([label, val, cls]) => (
              <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">{label}</div>
                <div className={`text-lg font-black ${cls}`}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
