import { useContext } from 'react';
import { AplicationContext } from '../Context/Aplication/context';
import { PermissionsConfig } from '../permissions/config';

export type Permission = keyof typeof PermissionsConfig;

export interface UsePermissionsReturn {
  can:            (permission: Permission) => boolean;
  canAny:         (permissions: Permission[]) => boolean;
  canAll:         (permissions: Permission[]) => boolean;
  isAdmin:        boolean;
  isCoordinator:  boolean;
  isReapplicator: boolean;
  hasProfile:     boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const context = useContext(AplicationContext);
  const user = context?.user;

  const can = (permission: Permission): boolean => {
    const rule = PermissionsConfig[permission];
    if (!rule) {
      console.warn(`[usePermissions] Permissão desconhecida: "${permission}"`);
      return false;
    }
    return rule(user);
  };

  const canAny = (permissions: Permission[]): boolean =>
    permissions.some((p) => can(p));

  const canAll = (permissions: Permission[]): boolean =>
    permissions.every((p) => can(p));

  return {
    can,
    canAny,
    canAll,
    isAdmin:        user?.role === 'ADMIN',
    isCoordinator:  user?.profileType === 'COORDINATOR',
    isReapplicator: user?.profileType === 'REAPPLICATOR',
    hasProfile:     !!user?.profileId,
  };
};
