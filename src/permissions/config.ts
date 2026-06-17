import { User } from '../Context/Users/type';

type PermissionRule = (user: User | undefined) => boolean;

const isAdmin        = (u: User | undefined) => u?.role === 'ADMIN';
const isCoordinator  = (u: User | undefined) => u?.profileType === 'COORDINATOR' || u?.profileType === 'COORDINATION_SUPPORT';
const isReapplicator = (u: User | undefined) => u?.profileType === 'REAPPLICATOR' || u?.profileType === 'OTHER';
const adminOrCoord   = (u: User | undefined) => isAdmin(u) || isCoordinator(u);
const ismonitoring    = (u: User | undefined) => u?.profileType === 'MONITORING';
const isCommunication = (u: User | undefined) => u?.profileType === 'COMMUNICATION';

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
  'meeting.uploadFiles':        (u) => isReapplicator(u) || adminOrCoord(u),
  'meeting.create':            (u) => adminOrCoord(u) || isReapplicator(u),


  // ── Projetos ──────────────────────────────────────────────────────────────
  'project.create': adminOrCoord,
  'project.edit':   (u) => adminOrCoord(u) || isCommunication(u),
  'project.delete': adminOrCoord,

  // ── Beneficiários ────────────────────────────────────────────────────────────
  'beneficiary.view':   (u) => adminOrCoord(u) || isReapplicator(u) || ismonitoring(u),
  'beneficiary.create': adminOrCoord,
  'beneficiary.edit':   adminOrCoord,
  'beneficiary.delete': adminOrCoord,

  // ── Matrículas ────────────────────────────────────────────────────────────
  'registration.view':   (u) => adminOrCoord(u) || isReapplicator(u),
  'registration.delete': adminOrCoord,

  // ── Tecnologias Sociais ───────────────────────────────────────────────────
  'socialTechnology.create': isAdmin,
  'socialTechnology.edit':   isAdmin,

  // ── Logs ──────────────────────────────────────────────────────────────────
  'logs.view': isAdmin,

  // ── Página Inicial ────────────────────────────────────────────────────────
  'initialPage.exportCsv': isAdmin,

  // ── Menu ──────────────────────────────────────────────────────────────────
  'menu.profiles': adminOrCoord,
  'menu.users':    adminOrCoord,
  'menu.logs':     isAdmin,
};
