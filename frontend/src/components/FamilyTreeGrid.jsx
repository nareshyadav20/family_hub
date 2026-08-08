import React, { useMemo } from 'react';
import { Search } from 'lucide-react';
import { buildFamilyGraph } from '../utils/familyGraph';

const FamilyTreeGrid = ({ members, relationships, familyHead, searchQuery = '' }) => {
  const { generations } = useMemo(() => {
    return buildFamilyGraph(members, relationships, familyHead?.id || null);
  }, [members, relationships, familyHead]);

  if (!generations || generations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white rounded-[24px] border border-[#E9E5F8]">
        <p className="text-[#6B7280] font-medium text-lg">No family members found.</p>
      </div>
    );
  }

  const isMatch = (member) => {
    if (!searchQuery) return false;
    const name = `${member?.firstName || ''} ${member?.lastName || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  };

  const getGenerationTitle = (genNum) => {
    if (genNum === 99) return "Disconnected Members";
    if (genNum === 0) return "Generation 0 — Family Head";
    if (genNum === 1) return "Generation 1 — Children";
    if (genNum === 2) return "Generation 2 — Grandchildren";
    return `Generation ${genNum}`;
  };

  return (
    <div className="w-full bg-[#FAF8FF] p-6 rounded-[24px] border border-[#E9E5F8] overflow-y-auto" style={{ minHeight: '600px' }}>
      <div className="flex flex-col gap-10">
        {generations.map((genObj, index) => (
          <div key={index} className="flex flex-col gap-4">
            <div className="flex items-center">
              <div className="h-px bg-gradient-to-r from-[#7C5CFC]/0 via-[#7C5CFC]/30 to-[#7C5CFC]/0 flex-1"></div>
              <h3 className="px-4 text-[13px] font-bold tracking-widest uppercase text-[#7C5CFC]">
                {getGenerationTitle(genObj.generationNumber)}
              </h3>
              <div className="h-px bg-gradient-to-r from-[#7C5CFC]/30 via-[#7C5CFC]/30 to-[#7C5CFC]/0 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {genObj.pairs.map((pair, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 bg-white p-5 rounded-2xl shadow-sm border border-[#E9E5F8] hover:shadow-md transition-shadow">
                  
                  {/* Primary Member */}
                  <div className={`flex-1 flex flex-col gap-2 p-3 rounded-xl ${isMatch(pair.primary) ? 'bg-[#7C5CFC]/10 border border-[#7C5CFC]/30' : 'bg-[#F9FAFB]'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#4F46E5] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {pair.primary.firstName?.charAt(0)}{pair.primary.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1F2430] text-base leading-tight">
                          {pair.primary.role === 'SUPER_ADMIN' ? '👑 ' : ''}
                          {pair.primary.firstName} {pair.primary.lastName}
                        </h4>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          {index === 0 && pair.primary.role === 'SUPER_ADMIN' ? 'Family Head' : pair.primary.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-[#4B5563] flex flex-col gap-1">
                      {pair.parents.length > 0 && (
                        <div className="flex gap-2">
                          <span className="font-semibold text-[#1F2430]">Parents:</span>
                          <span className="text-[#6B7280]">{pair.parents.map(p => p.firstName).join(' + ')}</span>
                        </div>
                      )}
                      {pair.children.length > 0 && (
                        <div className="flex gap-2">
                          <span className="font-semibold text-[#1F2430]">Children:</span>
                          <span className="text-[#6B7280] truncate" title={pair.children.map(c => c.firstName).join(', ')}>
                            {pair.children.map(c => c.firstName).join(', ')}
                          </span>
                        </div>
                      )}
                      {pair.siblings?.length > 0 && (
                        <div className="flex gap-2">
                          <span className="font-semibold text-[#1F2430]">Siblings:</span>
                          <span className="text-[#6B7280] truncate" title={pair.siblings.map(s => s.firstName).join(', ')}>
                            {pair.siblings.map(s => s.firstName).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Spouse (if any) */}
                  {pair.spouse && (
                    <>
                      <div className="hidden sm:flex flex-col items-center justify-center">
                        <div className="h-full w-px bg-dashed border-l-2 border-[#E9E5F8]"></div>
                        <div className="bg-white text-xs font-bold text-[#7C5CFC] px-1 py-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>SPOUSE</div>
                        <div className="h-full w-px bg-dashed border-l-2 border-[#E9E5F8]"></div>
                      </div>
                      <div className="sm:hidden flex items-center justify-center w-full py-2">
                         <span className="text-xs font-bold text-[#7C5CFC] bg-white px-3 border border-[#E9E5F8] rounded-full">SPOUSE</span>
                      </div>
                      
                      <div className={`flex-1 flex flex-col gap-2 p-3 rounded-xl ${isMatch(pair.spouse) ? 'bg-[#E83A82]/10 border border-[#E83A82]/30' : 'bg-[#FFF5F8]'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E83A82] to-[#FB7185] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                            {pair.spouse.firstName?.charAt(0)}{pair.spouse.lastName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1F2430] text-base leading-tight">
                              {pair.spouse.role === 'SUPER_ADMIN' ? '👑 ' : ''}
                              {pair.spouse.firstName} {pair.spouse.lastName}
                            </h4>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#E83A82]">
                              Spouse
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyTreeGrid;
