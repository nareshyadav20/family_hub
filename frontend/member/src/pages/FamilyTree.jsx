import React from 'react';
import ReactFlow, { 
  MiniMap, Controls, Background, useNodesState, useEdgesState 
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { id: '1', position: { x: 400, y: 50 }, data: { label: 'Robert Smith (Grandpa)' }, type: 'input' },
  { id: '2', position: { x: 550, y: 50 }, data: { label: 'Martha Smith (Grandma)' }, type: 'input' },
  { id: '3', position: { x: 250, y: 200 }, data: { label: 'James Smith (Father)' } },
  { id: '4', position: { x: 450, y: 200 }, data: { label: 'Sarah Smith (Mother)' } },
  { id: '5', position: { x: 700, y: 200 }, data: { label: 'William Smith (Uncle)' } },
  { id: '6', position: { x: 150, y: 350 }, data: { label: 'Arjun Mehta (Son)' }, type: 'output' },
  { id: '7', position: { x: 350, y: 350 }, data: { label: 'Emily Smith (Daughter)' }, type: 'output' },
];

const initialEdges = [
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e1-5', source: '1', target: '5' },
  { id: 'e2-5', source: '2', target: '5' },
  { id: 'e3-6', source: '3', target: '6', animated: true },
  { id: 'e4-6', source: '4', target: '6', animated: true },
  { id: 'e3-7', source: '3', target: '7' },
  { id: 'e4-7', source: '4', target: '7' },
];

export default function FamilyTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full flex flex-col space-y-4 animate-in fade-in duration-500">
       <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Tree</h1>
            <p className="text-muted-foreground text-sm mt-1">Interactive visualization of your lineage.</p>
          </div>
       </div>
       <div className="flex-1 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden min-h-[600px]">
         <ReactFlow
           nodes={nodes}
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           fitView
           className="bg-slate-50/50 dark:bg-slate-950/50"
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
