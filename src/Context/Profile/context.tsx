import { createContext, useContext } from 'react';
import { ProfileContextTypes } from './type';
import { ProfileState } from './state';

export const ProfileContext = createContext<ProfileContextTypes | null>(null);

const ProfileProvider = ({ children, fixedType }: { children: React.ReactNode; fixedType?: 'COORDINATOR' | 'COORDINATION_SUPPORT' | 'REAPPLICATOR' | 'OTHER' | 'COMMUNICATION' | 'ACCOUNTABILITY' }) => {
  const state = ProfileState(fixedType);
  return (
    <ProfileContext.Provider value={state}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileContext deve ser usado dentro de ProfileProvider');
  return ctx;
};

export default ProfileProvider;
