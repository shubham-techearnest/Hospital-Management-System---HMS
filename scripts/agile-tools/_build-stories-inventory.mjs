/**
 * Builds scripts/agile-tools/stories-inventory.mjs with 450–650 atomic stories.
 * Run: node _build-stories-inventory.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'stories-inventory.mjs');
const VISION = 'Product vision / docs/ssot — no package implementation';

const rows = [];

function ac(g, w, t, extra = []) {
  return ['Given ' + g, 'When ' + w, 'Then ' + t, ...extra].join('\n');
}
function flow(steps) {
  return steps.map((s, i) => `${i + 1}. ${s}`).join(' → ');
}
function add(p) {
  rows.push(p);
}
function bulk(domain, epic, mod, items) {
  let n = rows.filter((r) => r.id && r.id.startsWith('US-' + domain + '-')).length;
  for (const it of items) {
    n += 1;
    const id = it.id || `US-${domain}-${String(n).padStart(3, '0')}`;
    const story = it.story.startsWith('As a ')
      ? it.story
      : `As a ${it.actor}, I want ${it.story} so that ${it.so || 'I can complete my work'}.`;
    add({
      id,
      epic,
      module: mod,
      subModule: it.sub || mod,
      actor: it.actor,
      story,
      objective: it.obj || it.sub || 'Deliver capability',
      requirement: it.req || `System shall support ${it.sub || 'capability'}`,
      preconditions: it.pre || 'User authenticated with required role',
      trigger: it.trigger || 'User initiates action',
      mainFlow: it.flow || flow(['Open UI', 'Submit', 'API processes', 'Persist', 'UI confirms']),
      alternateFlow: it.alt,
      exceptionFlow: it.ex,
      ac: it.ac || ac('preconditions hold', 'user performs action', 'system completes and UI reflects outcome'),
      rules: it.rules || 'Hospital scope and RBAC enforced / RULE TO BE CONFIRMED',
      validation: it.validation,
      data: it.data || 'Domain entities updated as designed',
      api: it.api || 'N/A',
      db: it.db || 'N/A',
      web: it.web || 'N/A',
      mobile: it.mobile,
      notification: it.notification,
      audit: it.audit,
      integration: it.integration,
      deps: it.deps,
      priority: it.pri || 'P2 — Medium',
      status: it.status || 'UNKNOWN',
      evidence: it.ev || 'Code present — completeness UNKNOWN',
      notes: it.notes || 'None',
    });
  }
}

function atomics(domain, epic, mod, actor, baseEv, status, pri, titles) {
  const items = titles.map((t) => {
    if (typeof t === 'string') {
      return {
        sub: t,
        actor,
        story: `As a ${actor}, I want to ${t.charAt(0).toLowerCase() + t.slice(1)} so that care operations stay accurate.`,
        status,
        ev: baseEv,
        pri,
        api: baseEv.split(';')[0]?.trim() || 'N/A',
        web: baseEv.includes('Page') ? baseEv : 'N/A',
      };
    }
    return { actor, status, ev: baseEv, pri, ...t };
  });
  bulk(domain, epic, mod, items);
}

// ═══════════════════════════════════════════════════════════════════════════
// IAM
// ═══════════════════════════════════════════════════════════════════════════
bulk('IAM', 'EPIC-IAM-001', 'IAM', [
  { id: 'US-IAM-001', sub: 'Login JWT', actor: 'Any registered user', story: 'As a registered user, I want to sign in with email and password so that I receive a JWT session.', api: 'AuthController / AuthenticationService / JwtTokenService', web: 'LoginPage.tsx; roleNavigation.ts', status: 'IMPLEMENTED', ev: 'Phase C #2 — LoginPage.tsx → AuthenticationService / JwtTokenService → roleNavigation.ts', pri: 'P0 — Critical', pre: 'User account exists and is active', trigger: 'User submits LoginPage', flow: flow(['Open LoginPage', 'Enter credentials', 'AuthController authenticates', 'JwtTokenService issues tokens', 'roleNavigation redirects']), ac: ac('valid credentials and no MFA pending', 'I submit login', 'API returns tokens and web stores session then redirects') },
  { id: 'US-IAM-002', sub: 'MFA TOTP challenge', actor: 'User with MFA enabled', story: 'As a security-conscious user, I want to complete a TOTP MFA challenge after password success so that account takeover risk is reduced.', api: 'MfaService / TotpService', db: 'V77__mfa_totp.sql', web: 'Login MFA challenge', status: 'IMPLEMENTED', ev: 'Phase C #11 — MfaService / TotpService → V77', pri: 'P0 — Critical', pre: 'MFA enrolled (V77); password succeeded', trigger: 'MFA challenge presented', flow: flow(['Password OK', 'Enter TOTP', 'TotpService validates', 'Full session issued']) },
  { id: 'US-IAM-003', sub: 'MFA enroll', actor: 'Authenticated user', story: 'As an authenticated user, I want to enroll TOTP MFA from account settings so that I can protect my account.', api: 'MfaService', db: 'V77', web: 'AccountSettingsPage.tsx', status: 'IMPLEMENTED', ev: 'AccountSettingsPage.tsx → MfaService / TotpService → V77', pri: 'P0 — Critical', pre: 'User logged in', trigger: 'Start MFA setup', flow: flow(['Open AccountSettingsPage', 'Enroll TOTP', 'Confirm code', 'MFA active']) },
  { id: 'US-IAM-004', sub: 'Patient register UHID', actor: 'Public patient prospect', story: 'As a patient, I want to create a Health360 account so that I can request care and view my records.', api: 'AuthController → RegistrationService → PatientUhidAssignmentService', db: 'V42__patient_registry_uhid.sql', web: 'RegisterPage.tsx; authApi', status: 'IMPLEMENTED', ev: 'Phase C #1 — RegisterPage.tsx → authApi → AuthController → RegistrationService → PatientUhidAssignmentService → V42', pri: 'P0 — Critical', pre: 'Unauthenticated; email available', trigger: 'Submit RegisterPage', flow: flow(['Open RegisterPage', 'Submit registration', 'RegistrationService creates PATIENT', 'PatientUhidAssignmentService assigns UHID', 'Confirm']) },
  { id: 'US-IAM-005', sub: 'Password forgot', actor: 'Registered user', story: 'As a registered user, I want to request a password reset so that I can regain access.', api: 'AuthController', web: 'ForgotPasswordPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'ForgotPasswordPage.tsx; AuthController', pri: 'P1 — High' },
  { id: 'US-IAM-006', sub: 'Password reset', actor: 'Registered user', story: 'As a registered user, I want to set a new password with a reset token so that I can log in again.', api: 'AuthController', web: 'ResetPasswordPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'ResetPasswordPage.tsx; AuthController', pri: 'P1 — High' },
  { id: 'US-IAM-007', sub: 'Email verify', actor: 'Newly registered user', story: 'As a newly registered user, I want to verify my email so that my account is confirmed.', api: 'AuthController', web: 'VerifyEmailPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'VerifyEmailPage.tsx; AuthController', pri: 'P1 — High' },
  { id: 'US-IAM-008', sub: 'Twelve-role RBAC', actor: 'Platform', story: 'As the platform, I want twelve seeded IAM roles with method security so that portals and APIs enforce role boundaries.', api: '@PreAuthorize; RbacProbeController', web: 'RoleRoute; router.tsx', status: 'IMPLEMENTED', ev: 'AppRole / Flyway IAM seeds; router.tsx RoleRoute', pri: 'P0 — Critical' },
  { id: 'US-IAM-009', sub: 'Role portal redirect', actor: 'Authenticated user', story: 'As an authenticated user, I want to land in my role portal after login so that I reach the correct workspace.', web: 'roleNavigation.ts; RoleRoute.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'roleNavigation.ts; Phase C #2; BUG-AUTH-001', pri: 'P0 — Critical' },
  { id: 'US-IAM-010', sub: 'Account settings', actor: 'Authenticated user', story: 'As an authenticated user, I want to manage account settings so that I can update profile preferences.', api: 'UserController', web: 'AccountSettingsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'AccountSettingsPage.tsx; UserController', pri: 'P1 — High' },
  { id: 'US-IAM-011', sub: 'Notification prefs', actor: 'Authenticated user', story: 'As an authenticated user, I want to set notification preferences so that I control how I am contacted.', web: 'NotificationPreferencesPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'NotificationPreferencesPage.tsx', pri: 'P2 — Medium', notification: 'Email/SMS/push prefs — gateways may stub' },
  { id: 'US-IAM-012', sub: 'Patient invite complete', actor: 'Invited patient', story: 'As an invited patient, I want to complete my portal account so that I can access hospital-linked records.', web: 'CompletePatientAccountPage.tsx', status: 'UNKNOWN', ev: 'CompletePatientAccountPage.tsx', pri: 'P1 — High' },
  { id: 'US-IAM-013', sub: 'Hospital tenant scope', actor: 'Hospital staff', story: 'As hospital staff, I want my actions scoped to my hospital so that tenant data is isolated.', api: 'StaffController; hospital-scoped controllers', db: 'V63', status: 'PARTIALLY IMPLEMENTED', ev: 'StaffController; hospital-scoped controllers; V63', pri: 'P0 — Critical' },
  { id: 'US-IAM-014', sub: 'Logout', actor: 'Authenticated user', story: 'As an authenticated user, I want to log out so that my session is cleared on this device.', api: 'AuthController', status: 'PARTIALLY IMPLEMENTED', ev: 'AuthController; LoginPage session handling', pri: 'P0 — Critical' },
  { id: 'US-IAM-015', sub: 'Token refresh', actor: 'Authenticated user', story: 'As an authenticated user, I want my access token refreshed so that my session continues without re-login.', api: 'JwtTokenService; AuthController', web: 'authApi', status: 'PARTIALLY IMPLEMENTED', ev: 'JwtTokenService; authApi', pri: 'P0 — Critical' },
  { id: 'US-IAM-016', sub: 'Fix PATIENT RoleRoute', actor: 'Platform engineer', story: 'As a platform engineer, I want PATIENT routes gated by RoleRoute so that non-patients cannot access patient trees.', web: 'router.tsx; RoleRoute.tsx', status: 'PLANNED', ev: 'PHASE_C_VERIFICATION.md BUG-AUTH-001', pri: 'P1 — High' },
  { id: 'US-IAM-017', sub: 'Fix RoleRoute null user', actor: 'Platform engineer', story: 'As a platform engineer, I want RoleRoute to deny when user is null despite token so that auth bypass is closed.', web: 'RoleRoute.tsx', status: 'PLANNED', ev: 'PHASE_C_VERIFICATION.md BUG-AUTH-002', pri: 'P1 — High' },
  { id: 'US-IAM-018', sub: 'ABHA login', actor: 'Patient', story: 'As a patient, I want to sign in with ABHA so that I use national health identity.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
  { id: 'US-IAM-019', sub: 'ABDM consent exchange', actor: 'Hospital', story: 'As a hospital, I want ABDM consent artefacts so that records exchange is compliant.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
  { id: 'US-IAM-020', sub: 'Disable MFA', actor: 'Authenticated user', story: 'As an authenticated user, I want to disable MFA with verification so that I can recover from device loss.', api: 'MfaService', db: 'V77', web: 'AccountSettingsPage.tsx', status: 'UNKNOWN', ev: 'AccountSettingsPage.tsx; MfaService; V77', pri: 'P2 — Medium' },
  { id: 'US-IAM-021', sub: 'Session idle timeout', actor: 'Security officer', story: 'As a security officer, I want idle session timeout so that abandoned sessions expire.', status: 'PLANNED', ev: 'Auth session policy — RULE TO BE CONFIRMED', pri: 'P2 — Medium' },
  { id: 'US-IAM-022', sub: 'Permission seeds', actor: 'Platform', story: 'As the platform, I want permission-seeded method security so that fine-grained authorities are checked.', api: '@PreAuthorize permission seeds', status: 'PARTIALLY IMPLEMENTED', ev: 'IAM permission seed migrations; secured controllers', pri: 'P0 — Critical' },
  { id: 'US-IAM-023', sub: 'Change password', actor: 'Authenticated user', story: 'As an authenticated user, I want to change my password while logged in so that I can rotate credentials.', api: 'UserController / AuthController', web: 'AccountSettingsPage.tsx', status: 'UNKNOWN', ev: 'AccountSettingsPage.tsx; UserController', pri: 'P1 — High' },
  { id: 'US-IAM-024', sub: 'Multi-role switch', actor: 'User with multiple roles', story: 'As a user with multiple roles, I want to switch active role context so that I can work in the correct portal.', web: 'roleNavigation.ts', status: 'UNKNOWN', ev: 'roleNavigation.ts; JWT roles', pri: 'P2 — Medium' },
  { id: 'US-IAM-025', sub: 'Login lockout', actor: 'Security officer', story: 'As a security officer, I want failed login lockout so that brute force is limited.', status: 'PLANNED', ev: 'AuthController — lockout policy RULE TO BE CONFIRMED', pri: 'P2 — Medium' },
  { id: 'US-IAM-026', sub: 'Refresh revoke on password change', actor: 'Authenticated user', story: 'As an authenticated user, I want refresh tokens revoked when I change password so that old sessions die.', status: 'PLANNED', ev: 'AuthController / JwtTokenService — confirm revoke behavior', pri: 'P1 — High' },
  { id: 'US-IAM-027', sub: 'View own profile', actor: 'Authenticated user', story: 'As an authenticated user, I want to view my own profile summary so that I confirm identity details.', api: 'UserController', web: 'AccountSettingsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'UserController; AccountSettingsPage.tsx', pri: 'P1 — High' },
  { id: 'US-IAM-028', sub: 'Staff profile write', actor: 'Hospital staff', story: 'As hospital staff, I want my user profile writable where permitted so that contact details stay current.', api: 'StaffController / UserController', db: 'V71__staff_user_profile_write.sql', status: 'PARTIALLY IMPLEMENTED', ev: 'V71__staff_user_profile_write.sql; StaffController', pri: 'P2 — Medium' },
  { id: 'US-IAM-029', sub: 'Social login', actor: 'Patient', story: 'As a patient, I want social login so that registration is faster.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None' },
  { id: 'US-IAM-030', sub: 'Device trust list', actor: 'Authenticated user', story: 'As an authenticated user, I want to see trusted devices so that I can revoke unknown sessions.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None' },
]);

// ═══════════════════════════════════════════════════════════════════════════
// ADM / PUB / HOS — continue building in imported continuation via eval of more bulks
// ═══════════════════════════════════════════════════════════════════════════
import { registerDomains } from './_stories-domains.mjs';
registerDomains({ bulk, atomics, ac, flow, VISION, add, rows });

// Validate + write
const ids = new Set();
const errors = [];
for (const r of rows) {
  if (!r.id) errors.push('missing id');
  if (ids.has(r.id)) errors.push('dup ' + r.id);
  ids.add(r.id);
  if (!r.story?.startsWith('As a ')) errors.push(r.id + ' story');
  if (!r.actor || !r.ac || !r.status || !r.priority) errors.push(r.id + ' required');
  if ((r.status === 'IMPLEMENTED' || r.status === 'PARTIALLY IMPLEMENTED') && !r.evidence) errors.push(r.id + ' evidence');
}
if (errors.length) {
  console.error(errors.slice(0, 30));
  process.exit(1);
}
if (rows.length < 450 || rows.length > 650) {
  console.error('Count out of range:', rows.length);
  process.exit(1);
}

function esc(s) {
  if (s == null) return "''";
  return JSON.stringify(String(s));
}

const header = `/**
 * Health360 — Complete user stories inventory (atomic, evidence-based)
 * Consumed by build-complete-user-stories.mjs
 * Do not invent ABHA/ABDM/WhatsApp/telemedicine/ambulance/home-care/physio/AI-CDS as IMPLEMENTED.
 */

function S(o) {
  return {
    notification: 'None specified / RULE TO BE CONFIRMED',
    audit: 'Platform audit where applicable / RULE TO BE CONFIRMED',
    integration: 'None',
    deps: 'None',
    mobile: 'N/A or partial — verify mobile/health360-mobile',
    alternateFlow: 'N/A',
    exceptionFlow: 'System returns error; user informed',
    validation: 'Required fields validated client+server',
    ...o,
  };
}

export function stories() {
  return [
`;

const body = rows
  .map((r) => {
    const fields = [
      'id', 'epic', 'module', 'subModule', 'actor', 'story', 'objective', 'requirement',
      'preconditions', 'trigger', 'mainFlow', 'alternateFlow', 'exceptionFlow', 'ac',
      'rules', 'validation', 'data', 'api', 'db', 'web', 'mobile', 'notification', 'audit',
      'integration', 'deps', 'priority', 'status', 'evidence', 'notes',
    ];
    const inner = fields
      .filter((f) => r[f] != null && r[f] !== '')
      .map((f) => `    ${f}: ${esc(r[f])}`)
      .join(',\n');
    return `  S({\n${inner}\n  })`;
  })
  .join(',\n');

const footer = `
  ];
}
`;

fs.writeFileSync(OUT, header + body + footer, 'utf8');
console.log('Wrote', OUT, 'stories:', rows.length);
const by = {};
for (const r of rows) by[r.status] = (by[r.status] || 0) + 1;
console.log(by);
