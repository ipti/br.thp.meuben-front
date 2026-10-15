import { User } from '../Context/Users/type';

type PermissionRule = (user: User | undefined) => boolean;

const isAdmin         = (u: User | undefined) => u?.role === 'ADMIN';
const isCoordinator   = (u: User | undefined) => u?.profileType === 'COORDINATOR' || u?.profileType === 'COORDINATION_SUPPORT';
const isReapplicator  = (u: User | undefined) => u?.profileType === 'REAPPLICATOR' || u?.profileType === 'OTHER';
const isOficineiro    = (u: User | undefined) => u?.profileType === 'OFICINEIRO';
const adminOrCoord    = (u: User | undefined) => isAdmin(u) || isCoordinator(u);
const isCommunication = (u: User | undefined) => u?.profileType === 'COMMUNICATION';
const isAccountability = (u: User | undefined) => u?.profileType === 'ACCOUNTABILITY';
const canAddEnrollment = (u: User | undefined) => isReapplicator(u) || isOficineiro(u);
const hasLimitedBeneficiaryView = (u: User | undefined) =>
  canAddEnrollment(u) || isCommunication(u) || isAccountability(u);

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
  'meeting.editMembers':        (u) => adminOrCoord(u) || canAddEnrollment(u),
  'meeting.viewJustification':  (u) => canAddEnrollment(u),
  'meeting.uploadFiles':        (u) => canAddEnrollment(u) || adminOrCoord(u),
  'meeting.create':             (u) => adminOrCoord(u) || canAddEnrollment(u),


  // ── Projetos ──────────────────────────────────────────────────────────────
  'project.create': adminOrCoord,
  'project.edit':   (u) => adminOrCoord(u) || isCommunication(u),
  'project.delete': adminOrCoord,

  // ── Beneficiários ────────────────────────────────────────────────────────────
  'beneficiary.view':     (u) => adminOrCoord(u) || hasLimitedBeneficiaryView(u),
  'beneficiary.viewFull': adminOrCoord,
  'beneficiary.create':   (u) => adminOrCoord(u) || canAddEnrollment(u),
  'beneficiary.edit':     adminOrCoord,
  'beneficiary.delete':   adminOrCoord,

  // ── Matrículas ────────────────────────────────────────────────────────────
  'registration.view':    (u) => adminOrCoord(u) || hasLimitedBeneficiaryView(u),
  'registration.create':  (u) => adminOrCoord(u) || canAddEnrollment(u),
  'registration.edit':        adminOrCoord,
  'registration.editStatus':  (u) => adminOrCoord(u) || canAddEnrollment(u),
  'registration.delete':  adminOrCoord,

  // ── Tecnologias Sociais ───────────────────────────────────────────────────
  'socialTechnology.create': isAdmin,
  'socialTechnology.edit':   isAdmin,
  'socialTechnology.delete': isAdmin,

  // ── Tipos de Termo ───────────────────────────────────────────────────────
  'termType.create': isAdmin,
  'termType.edit':   isAdmin,
  'termType.delete': isAdmin,

  // ── Logs ──────────────────────────────────────────────────────────────────
  'logs.view': isAdmin,

  // ── Página Inicial ────────────────────────────────────────────────────────
  'initialPage.exportCsv': isAdmin,

  // ── Solicitações de acesso ────────────────────────────────────────────────
  'accessRequest.view':   isAdmin,
  'accessRequest.review': isAdmin,

  // ── Menu ──────────────────────────────────────────────────────────────────
  'menu.reapplicators':    adminOrCoord,
  'menu.perfis':           adminOrCoord,
  'menu.users':            adminOrCoord,
  'menu.logs':             isAdmin,
  'menu.termTypes':        isAdmin,
  'menu.accessRequests':   isAdmin,
};
