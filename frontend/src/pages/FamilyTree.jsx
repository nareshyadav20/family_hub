import React, { useMemo, useEffect, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'TB' ? 'top' : 'left';
    node.sourcePosition = direction === 'TB' ? 'bottom' : 'right';

    // Shift to top-left to center nodes around dagre coordinates
    node.position = {
      x: nodeWithPosition.x - 200 / 2,
      y: nodeWithPosition.y - 80 / 2,
    };
    return node;
  });

  return { nodes, edges };
};

export default function FamilyTree() {
  const { data = {}, isLoading } = useQuery({
    queryKey: ['familyTree'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/family/tree`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const { members = [], relationships = [] } = data;

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (members.length === 0) return;

    const initialNodes = members.map((m) => {
      return {
        id: String(m.id),
        data: { label: `${m.firstName} ${m.lastName}\n(${m.role || 'Member'})` },
        type: 'default',
        style: { width: 200, background: '#fff', border: '1px solid #7C5CFC', borderRadius: '8px', padding: '10px' }
      };
    });

    const initialEdges = relationships.map((rel) => {
      const isSpouse = rel.relationship === 'SPOUSE';
      return {
        id: `e-${rel.id}`,
        source: String(rel.fromMemberId),
        target: String(rel.toMemberId),
        label: rel.relationship === 'CUSTOM' ? rel.customRelationship : rel.relationship,
        type: 'smoothstep',
        animated: true,
        style: { stroke: isSpouse ? '#E83A82' : '#7C5CFC', strokeWidth: 2 },
        labelStyle: { fill: '#6B7280', fontWeight: 700 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSpouse ? '#E83A82' : '#7C5CFC',
        },
      };
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [members, relationships, setNodes, setEdges]);

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
