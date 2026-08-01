import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDomainStore = create(
  persist(
    (set) => ({
      familyId: null,
      domainId: null,
      domainStatus: null,
      setFamilyAndDomain: (familyId, domainId) => set({ familyId, domainId, domainStatus: 'PENDING_SETUP' }),
      setDomainStatus: (status) => set({ domainStatus: status }),
      clearDomain: () => set({ familyId: null, domainId: null, domainStatus: null })
    }),
    {
      name: 'domain-storage', // unique name
    }
  )
);

export default useDomainStore;
