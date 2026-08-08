import React, { useState } from 'react';
import { Home, Car, TrendingUp, Plus, MoreVertical, Edit2, Trash2, DollarSign, MapPin } from 'lucide-react';

const assets = {
  property: [],
  vehicles: [],
  investments: [],
};

const totalValue = '$0';

const tabIcons = { property: Home, vehicles: Car, investments: TrendingUp };

export default function Assets() {
  const [activeTab, setActiveTab] = useState('property');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 ">Family Assets</h1>
          <p className="text-sm text-slate-500 mt-1">Track properties, vehicles, and investments.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30">
          <Plus size={18} /> Add Asset
        </button>
      </div>

      {/* Net Worth Banner */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute w-40 h-40 rounded-full bg-white/5 -top-10 -right-10" />
        <div className="absolute w-24 h-24 rounded-full bg-white/5 bottom-0 left-24" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-8">
          <div>
            <p className="text-white/70 text-sm font-medium mb-2">Total Estimated Family Net Worth</p>
            <div className="text-5xl font-black">{totalValue}</div>
            <p className="text-white/60 text-sm mt-2">Across all properties, vehicles & investments</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[['🏡', '$0', 'Properties'], ['🚙', '$0', 'Vehicles'], ['📈', '$0', 'Investments']].map(([emoji, val, label]) => (
              <div key={label}>
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="text-xl font-black">{val}</div>
                <div className="text-white/60 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Object.entries(tabIcons).map(([tab, Icon]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white text-slate-600 border border-slate-200 '}`}>
            <Icon size={16} /> {tab}
          </button>
        ))}
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(assets[activeTab] || []).map((asset, i) => (
          <div key={asset.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${asset.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{asset.icon}</div>
                <div>
                  <div className="font-bold text-slate-900 text-sm line-clamp-1">{asset.name}</div>
                  <div style={{ color: asset.color }} className="text-xs font-semibold">{asset.type}</div>
                </div>
              </div>
              <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 :text-slate-200 opacity-0 group-hover:opacity-100 transition-all">
                <MoreVertical size={16} />
              </button>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-4">{asset.value}</div>
            <div className="space-y-2 border-t border-slate-100 pt-4">
              {Object.entries(asset).filter(([k]) => !['id','name','type','value','icon','color'].includes(k)).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400 capitalize">{key === 'return' ? 'YTD Return' : key}</span>
                  <span className={`font-bold ${key === 'return' ? 'text-emerald-600' : 'text-slate-700 '}`}>{val}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 :bg-indigo-500/20 transition-colors">
                <Edit2 size={12} /> Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 :bg-red-500/20 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
