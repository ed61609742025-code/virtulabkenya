// ============================================================
//  VirtuLab Kenya — Role-Based Access Control (RBAC) & Permissions
// ============================================================

const PERMISSIONS = Object.freeze({
  SCHOOLS_READ: 'schools:read',
  SCHOOLS_WRITE: 'schools:write',
  SCHOOLS_DELETE: 'schools:delete',
  USERS_READ: 'users:read',
  USERS_STATUS: 'users:status',
  USERS_RESET_PASSWORD: 'users:reset_password',
  USERS_RESET_PW: 'users:reset_password',
  ANNOUNCEMENTS_WRITE: 'announcements:write',
  ANALYTICS_READ: 'analytics:read',
  LICENSING_MANAGE: 'licensing:manage',
  TELEMETRY_READ: 'telemetry:read',
  TEAM_MANAGE: 'team:manage'
});

const PERMISSION_METADATA = [
  { id: PERMISSIONS.SCHOOLS_READ, label: 'View Schools', category: 'Schools', description: 'Access secondary school directory, institutional records, and roster counts' },
  { id: PERMISSIONS.SCHOOLS_WRITE, label: 'Register & Edit Schools', category: 'Schools', description: 'Register new institutions, update school profiles, and assign admin codes' },
  { id: PERMISSIONS.SCHOOLS_DELETE, label: 'Delete Schools', category: 'Schools', description: 'Permanently remove institutions from the national registry' },
  { id: PERMISSIONS.USERS_READ, label: 'View User Directory', category: 'Users', description: 'Inspect active student and verified teacher accounts across 47 counties' },
  { id: PERMISSIONS.USERS_STATUS, label: 'Suspend / Activate Accounts', category: 'Users', description: 'Toggle operational status for student and teacher accounts' },
  { id: PERMISSIONS.USERS_RESET_PASSWORD, label: 'Reset User Passwords', category: 'Users', description: 'Issue temporary credentials and dispatch password recovery emails' },
  { id: PERMISSIONS.ANNOUNCEMENTS_WRITE, label: 'Manage Broadcasts', category: 'Communications', description: 'Publish, toggle, and delete national notices, student alerts, and push notifications' },
  { id: PERMISSIONS.ANALYTICS_READ, label: 'KCSE Benchmarking & Analytics', category: 'Curriculum & Analytics', description: 'View practical exam pass rates, competency tiers, and school performance rankings' },
  { id: PERMISSIONS.LICENSING_MANAGE, label: 'Licensing & Billing', category: 'Finance & Licensing', description: 'Issue institutional / student licenses and monitor payment ledgers' },
  { id: PERMISSIONS.TELEMETRY_READ, label: 'Server Health & Audit Logs', category: 'Infrastructure', description: 'Monitor cluster nodes, system telemetry, and administrative audit trails' },
  { id: PERMISSIONS.TEAM_MANAGE, label: 'Manage Admin Team & Roles', category: 'Security & RBAC', description: 'Invite administrators, promote/demote roles, and configure granular permissions' }
];

const ROLES = Object.freeze({
  SUPERADMIN: 'superadmin',
  SCHOOL_REGISTRAR: 'school_registrar',
  CURRICULUM_INSPECTOR: 'curriculum_inspector',
  SUPPORT_ADMIN: 'support_admin',
  ADMIN: 'admin'
});

const ROLE_DEFINITIONS = {
  [ROLES.SUPERADMIN]: {
    key: ROLES.SUPERADMIN,
    name: 'Super Administrator',
    badge: 'Super Admin',
    badgeClass: 'superadmin',
    color: '#8B5CF6',
    description: 'Unrestricted system privileges, team governance, security auditing, and financial management.',
    permissions: Object.values(PERMISSIONS)
  },
  [ROLES.SCHOOL_REGISTRAR]: {
    key: ROLES.SCHOOL_REGISTRAR,
    name: 'School Registrar',
    badge: 'School Registrar',
    badgeClass: 'registrar',
    color: '#0284C7',
    description: 'Oversees secondary school onboarding, institutional directories, student/teacher enrollment rosters, and exports.',
    permissions: [
      PERMISSIONS.SCHOOLS_READ,
      PERMISSIONS.SCHOOLS_WRITE,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.ANALYTICS_READ
    ]
  },
  [ROLES.CURRICULUM_INSPECTOR]: {
    key: ROLES.CURRICULUM_INSPECTOR,
    name: 'Curriculum Inspector',
    badge: 'Curriculum Inspector',
    badgeClass: 'inspector',
    color: '#10B981',
    description: 'Ministry & QASO quality assurance inspector: reviews KCSE benchmarking, practical pass rates, and MoE accreditation reports.',
    permissions: [
      PERMISSIONS.SCHOOLS_READ,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.TELEMETRY_READ
    ]
  },
  [ROLES.SUPPORT_ADMIN]: {
    key: ROLES.SUPPORT_ADMIN,
    name: 'Support Administrator',
    badge: 'Support Admin',
    badgeClass: 'support',
    color: '#F59E0B',
    description: 'Helpdesk & frontline operations: student/teacher account recovery, status toggling, and national broadcasts.',
    permissions: [
      PERMISSIONS.SCHOOLS_READ,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_STATUS,
      PERMISSIONS.USERS_RESET_PASSWORD,
      PERMISSIONS.ANNOUNCEMENTS_WRITE
    ]
  },
  [ROLES.ADMIN]: {
    key: ROLES.ADMIN,
    name: 'General Administrator',
    badge: 'Administrator',
    badgeClass: 'admin',
    color: '#06B6D4',
    description: 'Standard institutional administrative operations across schools, user rosters, broadcasts, analytics, and diagnostics.',
    permissions: [
      PERMISSIONS.SCHOOLS_READ,
      PERMISSIONS.SCHOOLS_WRITE,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_STATUS,
      PERMISSIONS.USERS_RESET_PASSWORD,
      PERMISSIONS.ANNOUNCEMENTS_WRITE,
      PERMISSIONS.ANALYTICS_READ,
      PERMISSIONS.LICENSING_MANAGE,
      PERMISSIONS.TELEMETRY_READ
    ]
  }
};

// Expose defaultPermissions alias for client compatibility
Object.values(ROLE_DEFINITIONS).forEach(def => {
  def.defaultPermissions = def.permissions;
});

/**
 * Normalizes input role string to canonical key or aliases.
 */
function normalizeRole(role) {
  if (!role || typeof role !== 'string') return ROLES.ADMIN;
  const clean = role.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (clean === 'superadmin' || clean === 'super_admin' || clean === 'super') return ROLES.SUPERADMIN;
  if (clean === 'school_registrar' || clean === 'registrar') return ROLES.SCHOOL_REGISTRAR;
  if (clean === 'curriculum_inspector' || clean === 'inspector' || clean === 'qaso') return ROLES.CURRICULUM_INSPECTOR;
  if (clean === 'support_admin' || clean === 'support' || clean === 'helpdesk') return ROLES.SUPPORT_ADMIN;
  if (clean === 'admin' || clean === 'administrator') return ROLES.ADMIN;
  return ROLE_DEFINITIONS[clean] ? clean : ROLES.ADMIN;
}

/**
 * Returns effective deduplicated array of permissions for a role with optional custom overrides.
 */
function getEffectivePermissions(role, customPermissions = []) {
  const normRole = normalizeRole(role);
  if (normRole === ROLES.SUPERADMIN) {
    return Object.values(PERMISSIONS);
  }
  if (Array.isArray(customPermissions) && customPermissions.length > 0) {
    return customPermissions.filter(p => Object.values(PERMISSIONS).includes(p));
  }
  const def = ROLE_DEFINITIONS[normRole] || ROLE_DEFINITIONS[ROLES.ADMIN];
  return [...def.permissions];
}

/**
 * Checks whether an admin object or role possesses a required permission.
 * Supports:
 *   hasPermission(adminObj, requiredPermission)
 *   hasPermission(roleString, requiredPermission)
 *   hasPermission(roleString, customPermissions, requiredPermission)
 */
function hasPermission(adminOrRole, permOrCustom, maybePerm) {
  if (!adminOrRole) return false;
  let role;
  let customPerms = [];
  let requiredPermission;

  if (typeof adminOrRole === 'string') {
    role = normalizeRole(adminOrRole);
    if (maybePerm !== undefined) {
      customPerms = Array.isArray(permOrCustom) ? permOrCustom : [];
      requiredPermission = maybePerm;
    } else {
      requiredPermission = permOrCustom;
    }
  } else {
    role = normalizeRole(adminOrRole.adminRole || adminOrRole.role);
    customPerms = adminOrRole.permissions || [];
    requiredPermission = permOrCustom;
  }

  if (role === ROLES.SUPERADMIN) return true;

  const perms = getEffectivePermissions(role, customPerms);
  return perms.includes(requiredPermission);
}

module.exports = {
  PERMISSIONS,
  PERMISSION_METADATA,
  ROLES,
  ROLE_DEFINITIONS,
  normalizeRole,
  getEffectivePermissions,
  hasPermission
};
