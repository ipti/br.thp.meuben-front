import { User } from '../Context/Users/type';

type PermissionRule = (user: User | undefined) => boolean;

const isAdmin        = (u: User | undefined) => u?.role === 'ADMIN';
const isCoordinator  = (u: User | undefined) => u?.profileType === 'COORDINATOR';
const isReapplicator = (u: User | undefined) => u?.profileType === 'REAPPLICATOR';
const adminOrCoord   = (u: User | undefined) => isAdmin(u) || isCoordinator(u);

// Para alterar quem pode fazer o quê: editar apenas este arquivo.
export const PermissionsConfig: Record<string, PermissionRule> = {

  // ── Perfis ────────────────────────────────────────────────────────────────
  'profile.view':      adminOrCoord,
  'profile.create':    isAdmin,
  'profile.edit':      isAdmin,
  'profile.delete':    isAdmin,
  'profile.linkUser':  isAdmin,

  // ── Usuários ──────────────────────────────────────────────────────────────
  'user.view':             adminOrCoord,
  'user.create':           isAdmin,
  'user.edit':             isAdmin,
  'user.delete':           isAdmin,
  'user.changePassword':   isAdmin,

  // ── Turmas ────────────────────────────────────────────────────────────────
  'classroom.create':  adminOrCoord,
  'classroom.edit':    adminOrCoord,
  'classroom.delete':  adminOrCoord,
  'classroom.actions': adminOrCoord,

  // ── Reuniões ──────────────────────────────────────────────────────────────
  'meeting.delete':             adminOrCoord,
  'meeting.editStatus':         adminOrCoord,
  'meeting.editMembers':        adminOrCoord,
  'meeting.viewJustification':  isReapplicator,
  'meeting.uploadFiles':        isReapplicator,

  // ── Projetos ──────────────────────────────────────────────────────────────
  'project.create': adminOrCoord,
  'project.edit':   adminOrCoord,
  'project.delete': adminOrCoord,

  // ── Matrículas ────────────────────────────────────────────────────────────
  'registration.view':   adminOrCoord,
  'registration.delete': adminOrCoord,

  // ── Tecnologias Sociais ───────────────────────────────────────────────────
  'socialTechnology.create': isAdmin,
  'socialTechnology.edit':   isAdmin,

  // ── Logs ──────────────────────────────────────────────────────────────────
  'logs.view': isAdmin,

  // ── Menu ──────────────────────────────────────────────────────────────────
  'menu.profiles': adminOrCoord,
  'menu.users':    adminOrCoord,
  'menu.logs':     isAdmin,
};
