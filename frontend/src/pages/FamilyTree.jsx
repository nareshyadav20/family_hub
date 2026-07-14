import React, { useCallback } from 'react';
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
      const res = await axios.get('http://localhost:5000/api/v1/admin/members', {
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

  // We can dynamically render edges if fatherId/motherId existed properly. 
  // For basic sync requirement, we just map out nodes dynamically to show instant add feature.
  const dynamicEdges = [];

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    setNodes(dynamicNodes);
    setEdges(dynamicEdges);
  }, [members]);

  return (
    <div className="h-full w-full flex flex-col space-y-4 animate-in fade-in duration-500">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Tree</h1>
            <p className="text-muted-foreground text-sm mt-1">Interactive visualization of your lineage.</p>
          </div>
       </div>
       <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
         <ReactFlow
           nodes={nodes}
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           fitView
           className="bg-slate-50 dark:bg-slate-950"
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
