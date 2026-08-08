import React, { useMemo, useEffect, useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import FamilyTreeGrid from '../components/FamilyTreeGrid';
import { Search } from 'lucide-react';
import { buildFamilyGraph } from '../utils/familyGraph';

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

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('family_tree_view_mode') || 'tree';
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('family_tree_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (members.length === 0) return;

    const { calculatedMembers, normalizedRelationships } = buildFamilyGraph(members, relationships, data.familyHead?.id);

    const initialNodes = calculatedMembers.map((m) => {
      return {
        id: String(m.id),
        data: { label: m.role === 'SUPER_ADMIN' ? `👑 ${m.firstName} ${m.lastName}` : `${m.firstName} ${m.lastName}` },
        type: 'default',
        style: { width: 200, background: '#fff', border: '1px solid #7C5CFC', borderRadius: '8px', padding: '10px' }
      };
    });

    const initialEdges = normalizedRelationships.map((rel) => {
      const isSpouse = rel.type === 'SPOUSE';
      return {
        id: `e-${rel.originalId || `${rel.source}-${rel.target}`}`,
        source: rel.source,
        target: rel.target,
        label: isSpouse ? 'SPOUSE' : rel.label,
        type: 'smoothstep',
        animated: !isSpouse,
        style: { stroke: isSpouse ? '#E83A82' : '#7C5CFC', strokeWidth: 2, strokeDasharray: isSpouse ? '5,5' : '0' },
        labelStyle: { fill: '#6B7280', fontWeight: 700 },
        markerEnd: isSpouse ? undefined : {
          type: MarkerType.ArrowClosed,
          color: '#7C5CFC',
        },
      };
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [members, relationships, setNodes, setEdges, data.familyHead]);

  return (
    <div className="h-full w-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1F2430]">Family Tree</h1>
          <p className="text-[#6B7280] text-[15px] font-semibold mt-1">Interactive visualization of your lineage.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
            <input 
              type="text" 
              placeholder="Search member..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-[#E9E5F8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 w-64 shadow-sm"
            />
          </div>
          <div className="flex bg-[#F3F4F6] p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'tree' 
                  ? 'bg-white text-[#7C5CFC] shadow-sm' 
                  : 'text-[#6B7280] hover:text-[#4B5563]'
              }`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white text-[#7C5CFC] shadow-sm' 
                  : 'text-[#6B7280] hover:text-[#4B5563]'
              }`}
            >
              Grid View
            </button>
          </div>
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
        
        {viewMode === 'tree' ? (
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
        ) : (
          <FamilyTreeGrid 
             members={members} 
             relationships={relationships} 
             familyHead={data.familyHead} 
             searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
}
