import { useContext } from 'react';
import { AplicationContext } from '../Context/Aplication/context';
import { PermissionsConfig } from '../permissions/config';
import { PropsAplicationContext } from '../Types/types';

export const usePermissions = () => {
  const context = useContext(AplicationContext) as PropsAplicationContext | null;
  const user = context?.user;

  const can = (permission: string): boolean => {
    const rule = PermissionsConfig[permission];
    return rule ? rule(user) : false;
  };

  const isAdmin = user?.role === 'ADMIN';

  return { can, isAdmin };
};
