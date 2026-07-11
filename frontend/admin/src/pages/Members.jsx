import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const mockMembers = [
  { id: 1, name: "Robert Smith", role: "Super Admin", relation: "Head", phone: "+1 234 567 890", email: "robert@smith.com" },
  { id: 2, name: "Mary Smith", role: "Family Admin", relation: "Spouse", phone: "+1 234 567 891", email: "mary@smith.com" },
  { id: 3, name: "James Smith", role: "Member", relation: "Son", phone: "+1 234 567 892", email: "james@smith.com" },
  { id: 4, name: "Patricia Dove", role: "Member", relation: "Daughter", phone: "+1 234 567 893", email: "patricia@dove.com" },
  { id: 5, name: "William Smith", role: "Member", relation: "Brother", phone: "+1 234 567 894", email: "will@smith.com" },
];

export default function Members() {
  const [search, setSearch] = useState("");
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h1 className="text-3xl font-bold tracking-tight">Family Directory</h1>
           <p className="text-muted-foreground text-sm mt-1">Manage family members and their access levels.</p>
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-9 h-10 bg-white dark:bg-slate-900 border-none shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] focus-visible:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10 border-0 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] bg-white dark:bg-slate-900 hover:bg-slate-50">
              <Filter className="h-4 w-4 mr-2 text-slate-500" /> Filters
            </Button>
            <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50">
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
         </div>
      </div>
      
      <Card className="border-0 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 tracking-wider uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Relationship</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockMembers.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-blue-50/30 dark:hover:bg-slate-800/80 transition-colors group">
                  <td className="px-6 py-4 font-medium flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {m.name.split(" ").map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-[15px]">{m.name}</div>
                      <div className="text-xs text-slate-500 font-normal">Active yesterday</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-slate-700 dark:text-slate-300 font-medium">{m.email}</div>
                     <div className="text-slate-500 text-xs mt-0.5">{m.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{m.relation}</td>
                  <td className="px-6 py-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5
                        ${m.role === 'Super Admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                          m.role === 'Family Admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}
                     `}>
                       {m.role === 'Super Admin' && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                       {m.role === 'Family Admin' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                       {m.role === 'Member' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                       {m.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
