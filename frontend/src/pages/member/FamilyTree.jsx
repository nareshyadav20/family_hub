import React from 'react';
import ReactFlow, { 
  MiniMap, Controls, Background, useNodesState, useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function FamilyTree() {
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/members`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const dynamicNodes = members.map((m, i) => ({
    id: String(m.id),
    position: { x: (i % 4) * 250 + 100, y: Math.floor(i / 4) * 180 + 100 },
    data: { label: `${m.firstName} ${m.lastName}\n(${m.relationship || 'Member'})` },
    type: m.status === 'INVITATION_SENT' ? 'default' : 'output'
  }));

  const dynamicEdges = [];

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    setNodes(dynamicNodes);
    setEdges(dynamicEdges);
  }, [members]);

  return (
    <div className="h-full w-full flex flex-col space-y-4 animate-in fade-in duration-500">
       <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1F2430]">Family Tree</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Interactive visualization of your lineage.</p>
          </div>
       </div>
       <div className="flex-1 bg-white rounded-[24px] border border-[#E9E5F8] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden min-h-[600px]">
         <ReactFlow
           nodes={nodes}
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           fitView
           className="bg-[#FCFBFF]/50"
         >
           <Controls />
           <MiniMap 
             nodeColor={(node) => {
               switch (node.type) {
                 case 'input': return '#3b82f6';
                 case 'output': return '#10b981';
                 default: return '#6366f1';
               }
             }}
           />
           <Background variant="dots" gap={12} size={1} />
         </ReactFlow>
       </div>
    </div>
  );
}
