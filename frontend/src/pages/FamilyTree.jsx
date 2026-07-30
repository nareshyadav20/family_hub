import React, { useMemo, useEffect } from 'react';
import ReactFlow, { 
  MiniMap, Controls, Background, useNodesState, useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function FamilyTree() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/members`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const dynamicNodes = useMemo(() => {
    return members.map((m, i) => ({
      id: String(m.id),
      position: { x: (i % 4) * 250 + 100, y: Math.floor(i / 4) * 180 + 100 },
      data: { label: `${m.firstName} ${m.lastName}\n(${m.relationship || 'Member'})` },
      type: m.status === 'INVITATION_SENT' ? 'default' : 'output'
    }));
  }, [members]);

  const dynamicEdges = useMemo(() => [], [members]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    setNodes(dynamicNodes);
    setEdges(dynamicEdges);
  }, [dynamicNodes, dynamicEdges, setNodes, setEdges]);

  return (
    <div className="h-full w-full flex flex-col space-y-6 animate-in fade-in duration-500">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1F2430]">Family Tree</h1>
            <p className="text-[#6B7280] text-[15px] font-semibold mt-1">Interactive visualization of your lineage.</p>
          </div>
       </div>
       <div className="flex-1 bg-white rounded-[24px] border border-[#E9E5F8] shadow-sm overflow-hidden min-h-[600px] relative">
         {isLoading && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[24px]">
             <div className="flex flex-col items-center gap-3">
               <div className="w-10 h-10 border-4 border-[#7C5CFC]/20 border-t-[#7C5CFC] rounded-full animate-spin" />
               <p className="text-[#6B7280] font-semibold animate-pulse">Loading Family Tree...</p>
             </div>
           </div>
         )}
         <ReactFlow
           nodes={nodes}
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           fitView
           className="bg-[#FAF8FF]"
         >
           <Controls />
           <MiniMap 
             nodeColor={(node) => {
               switch (node.type) {
                 case 'input': return '#7C5CFC';
                 case 'output': return '#2EB67D';
                 default: return '#7C5CFC';
               }
             }}
           />
           <Background variant="dots" gap={12} size={1} />
         </ReactFlow>
       </div>
    </div>
  );
}
