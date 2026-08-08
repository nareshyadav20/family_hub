export const buildFamilyGraph = (members, relationships, familyHeadId = null) => {
  if (!members || members.length === 0) {
    return { calculatedMembers: [], normalizedRelationships: [], generations: [] };
  }

  // 1. Filter out completely disconnected Super Admins (auth accounts without family ties)
  // But wait, the user said: "If Naresh User is ONLY an authentication account... No Naresh User node."
  // A member is "tied" if they are part of any relationship, OR if they are the explicit familyHead.
  const memberMap = new Map();
  members.forEach(m => memberMap.set(String(m.id), { ...m, generation: null }));

  const validIds = new Set(memberMap.keys());
  const relationshipEdges = [];

  const parentMap = new Map(); // childId -> [parentIds]
  const childrenMap = new Map(); // parentId -> [childIds]
  const spouseMap = new Map(); // memberId -> spouseId
  const siblingMap = new Map(); // memberId -> [siblingIds]
  const connectedIds = new Set();

  // 2. Normalize Relationships
  relationships.forEach(rel => {
    const fromId = String(rel.fromMemberId);
    const toId = String(rel.toMemberId);

    if (!validIds.has(fromId) || !validIds.has(toId)) return;
    
    connectedIds.add(fromId);
    connectedIds.add(toId);

    const relName = (rel.relationship || '').toUpperCase();
    
    // Parents
    if (['FATHER', 'MOTHER', 'PARENT'].includes(relName)) {
      relationshipEdges.push({ source: fromId, target: toId, type: 'PARENT_CHILD', label: relName, originalId: rel.id });
      if (!parentMap.has(toId)) parentMap.set(toId, new Set());
      parentMap.get(toId).add(fromId);
      
      if (!childrenMap.has(fromId)) childrenMap.set(fromId, new Set());
      childrenMap.get(fromId).add(toId);
    }
    // Children (Reversed direction)
    else if (['SON', 'DAUGHTER', 'CHILD', 'GRANDSON', 'GRANDDAUGHTER'].includes(relName)) {
      relationshipEdges.push({ source: toId, target: fromId, type: 'PARENT_CHILD', label: relName, originalId: rel.id });
      if (!parentMap.has(fromId)) parentMap.set(fromId, new Set());
      parentMap.get(fromId).add(toId);

      if (!childrenMap.has(toId)) childrenMap.set(toId, new Set());
      childrenMap.get(toId).add(fromId);
    }
    // Spouse
    else if (relName === 'SPOUSE') {
      // Avoid duplicates
      if (!spouseMap.has(fromId) && !spouseMap.has(toId)) {
        relationshipEdges.push({ source: fromId, target: toId, type: 'SPOUSE', label: 'SPOUSE', originalId: rel.id });
        spouseMap.set(fromId, toId);
        spouseMap.set(toId, fromId);
      }
    }
    // Siblings
    else if (['SIBLING', 'BROTHER', 'SISTER'].includes(relName)) {
      relationshipEdges.push({ source: fromId, target: toId, type: 'SIBLING', label: relName, originalId: rel.id });
      if (!siblingMap.has(fromId)) siblingMap.set(fromId, new Set());
      if (!siblingMap.has(toId)) siblingMap.set(toId, new Set());
      siblingMap.get(fromId).add(toId);
      siblingMap.get(toId).add(fromId);
    }
  });

  // Prune disconnected auth-only SUPER_ADMIN accounts
  const finalMembers = [];
  members.forEach(m => {
    const id = String(m.id);
    if (m.role === 'SUPER_ADMIN' && !connectedIds.has(id) && id !== String(familyHeadId)) {
      memberMap.delete(id);
      validIds.delete(id);
    } else {
      finalMembers.push(memberMap.get(id));
    }
  });

  // 3. Determine Root for generations
  let rootId = null;
  if (familyHeadId && validIds.has(String(familyHeadId))) {
    rootId = String(familyHeadId);
  } else if (validIds.size > 0) {
    // Find someone with no parents (oldest generation)
    const possibleRoots = finalMembers.filter(m => !parentMap.has(String(m.id)));
    rootId = possibleRoots.length > 0 ? String(possibleRoots[0].id) : String(finalMembers[0].id);
  }

  // 4. Calculate Generations via BFS
  if (rootId) {
    const queue = [{ id: rootId, gen: 0 }];
    const visited = new Set();
    
    while (queue.length > 0) {
      const { id, gen } = queue.shift();
      if (visited.has(id)) continue;
      
      visited.add(id);
      const member = memberMap.get(id);
      if (member) member.generation = gen;

      // Spouse is same generation
      const spouseId = spouseMap.get(id);
      if (spouseId && !visited.has(spouseId)) {
        queue.push({ id: spouseId, gen: gen });
      }

      // Siblings are same generation
      if (siblingMap.has(id)) {
        siblingMap.get(id).forEach(siblingId => {
          if (!visited.has(siblingId)) queue.push({ id: siblingId, gen: gen });
        });
      }

      // Children are gen + 1
      if (childrenMap.has(id)) {
        childrenMap.get(id).forEach(childId => {
          if (!visited.has(childId)) queue.push({ id: childId, gen: gen + 1 });
        });
      }

      // Parents are gen - 1
      if (parentMap.has(id)) {
        parentMap.get(id).forEach(parentId => {
          if (!visited.has(parentId)) queue.push({ id: parentId, gen: gen - 1 });
        });
      }
    }
    
    // Fallback for disconnected clusters
    finalMembers.forEach(m => {
      const id = String(m.id);
      if (!visited.has(id)) {
        m.generation = 99; // Put them at the bottom
      }
    });
  }

  // Shift generations so the minimum is 0
  let minGen = Infinity;
  finalMembers.forEach(m => {
    if (m.generation !== null && m.generation < minGen) {
      minGen = m.generation;
    }
  });

  if (minGen < 0 || minGen > 0) {
    finalMembers.forEach(m => {
      if (m.generation !== null && m.generation !== 99) {
        m.generation -= minGen;
      }
    });
  }

  // 5. Group by generation for the Grid
  const generationMap = new Map();
  finalMembers.forEach(m => {
    if (!generationMap.has(m.generation)) generationMap.set(m.generation, []);
    generationMap.get(m.generation).push(m);
  });

  const sortedGens = Array.from(generationMap.keys()).sort((a, b) => a - b);
  
  const generations = sortedGens.map(genNum => {
    const genMembers = generationMap.get(genNum);
    const processed = new Set();
    const pairs = [];

    genMembers.forEach(m => {
      const id = String(m.id);
      if (processed.has(id)) return;
      
      processed.add(id);
      
      const spouseId = spouseMap.get(id);
      let spouse = null;
      if (spouseId && genMembers.some(sm => String(sm.id) === spouseId)) {
        spouse = memberMap.get(spouseId);
        processed.add(spouseId);
      }

      pairs.push({
        primary: m,
        spouse: spouse,
        parents: Array.from(parentMap.get(id) || []).map(pid => memberMap.get(pid)).filter(Boolean),
        children: Array.from(childrenMap.get(id) || []).map(cid => memberMap.get(cid)).filter(Boolean),
        siblings: Array.from(siblingMap.get(id) || []).map(sid => memberMap.get(sid)).filter(Boolean)
      });
    });
    
    return {
      generationNumber: genNum,
      pairs
    };
  });

  // Debugging output as requested
  console.table(relationshipEdges.map(r => ({
    source: r.source,
    target: r.target,
    type: r.type,
    label: r.label
  })));

  console.table(finalMembers.map(m => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    generation: m.generation,
    role: m.role
  })));

  return {
    calculatedMembers: finalMembers,
    normalizedRelationships: relationshipEdges,
    generations
  };
};
