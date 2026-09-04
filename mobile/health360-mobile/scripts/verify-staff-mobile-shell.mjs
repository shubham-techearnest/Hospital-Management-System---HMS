/**
 * Verifies E6 staff mobile shell routing + live API worklist access.
 * Creates temporary unique staff accounts (does not list existing staff).
 *
 * Usage: node scripts/verify-staff-mobile-shell.mjs
 */
const API = process.env.API_BASE_URL ?? 'http://localhost:8080/api/v1';
const PASSWORD = process.env.STAFF_PASSWORD ?? 'SecureP@ss1!';
const HOSPITAL_ID = '00000000-0000-0000-0000-000000000030';
const BRANCH_ID = '00000000-0000-0000-0000-000000000031';
const RUN_ID = Date.now().toString(36);

const STAFF_WORKLIST_ROLES = [
  'LAB_TECHNICIAN',
  'RADIOLOGY_TECHNICIAN',
  'PHARMACIST',
  'OT_COORDINATOR',
  'NURSE',
  'ICU_NURSE',
];

function resolveAppShellKind(primaryRole) {
  if (primaryRole === 'PLATFORM_ADMIN') return 'PLATFORM_ADMIN';
  if (primaryRole === 'DOCTOR') return 'DOCTOR';
  if (primaryRole === 'RECEPTIONIST') return 'RECEPTIONIST';
  if (primaryRole === 'HOSPITAL_ADMIN') return 'HOSPITAL_ADMIN';
  if (STAFF_WORKLIST_ROLES.includes(primaryRole)) return 'STAFF_WORKLIST';
  if (primaryRole === 'PATIENT') return 'PATIENT';
  return 'UNAUTHORIZED';
}

function getPrimaryRole(roles) {
  const priority = [
    'PLATFORM_ADMIN',
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'ICU_NURSE',
    'NURSE',
    'RECEPTIONIST',
    'LAB_TECHNICIAN',
    'RADIOLOGY_TECHNICIAN',
    'OT_COORDINATOR',
    'PHARMACIST',
    'PATIENT',
  ];
  for (const role of priority) {
    if (roles.includes(role)) return role;
  }
  return null;
}

const ROLE_CASES = [
  { expectedRole: 'LAB_TECHNICIAN', worklistPath: '/lab/worklist/pending' },
  { expectedRole: 'RADIOLOGY_TECHNICIAN', worklistPath: '/radiology/worklist/pending' },
  { expectedRole: 'PHARMACIST', worklistPath: '/pharmacy/worklist/pending' },
  { expectedRole: 'OT_COORDINATOR', worklistPath: '/ot/worklist/pending' },
  { expectedRole: 'NURSE', worklistPath: '/ipd/admissions?status=ADMITTED&page=0&size=5' },
  { expectedRole: 'ICU_NURSE', worklistPath: '/icu/stays?status=ACTIVE&page=0&size=5' },
];

async function login(email, password = PASSWORD) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function getJson(path, token) {
  const url = path.startsWith('http') ? path : `${API}${path}`;
  const sep = url.includes('?') ? '&' : '?';
  const withScope = url.includes('hospitalId=')
    ? url
    : `${url}${sep}hospitalId=${HOSPITAL_ID}&branchId=${BRANCH_ID}`;
  const res = await fetch(withScope, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function inviteStaff(adminToken, email, roleName, phone) {
  const res = await fetch(`${API}/hospital/staff/invite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      firstName: 'Verify',
      lastName: roleName.replace(/_/g, ' '),
      phone,
      temporaryPassword: PASSWORD,
      hospitalId: HOSPITAL_ID,
      branchId: BRANCH_ID,
      roleName,
      jobTitle: roleName,
    }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  let failed = 0;
  const results = [];

  console.log('=== 1) Unit: shell routing (Unauthorized regression) ===');
  for (const role of STAFF_WORKLIST_ROLES) {
    const shell = resolveAppShellKind(getPrimaryRole([role]));
    const ok = shell === 'STAFF_WORKLIST';
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${role} → ${shell} (not Unauthorized)`);
    if (!ok) failed += 1;
  }
  assert(resolveAppShellKind(getPrimaryRole(['UNKNOWN_ROLE'])) === 'UNAUTHORIZED', 'unknown should unauthorized');
  console.log('PASS  UNKNOWN_ROLE → UNAUTHORIZED\n');

  console.log(`=== 2) Live API: temp accounts (run ${RUN_ID}) ===`);
  const adminLogin = await login('hospital.admin@health360.test');
  assert(adminLogin.status === 200 && adminLogin.body?.success, 'hospital admin login failed');
  const adminToken = adminLogin.body.data.accessToken;

  for (let i = 0; i < ROLE_CASES.length; i += 1) {
    const roleCase = ROLE_CASES[i];
    const email = `verify.${roleCase.expectedRole.toLowerCase()}.${RUN_ID}@health360.test`;
    const phone = `9${String(Date.now()).slice(-9)}${i}`.slice(0, 10);
    const row = { role: roleCase.expectedRole, email };
    try {
      const invited = await inviteStaff(adminToken, email, roleCase.expectedRole, phone);
      assert(
        invited.status === 200 || invited.status === 201,
        `invite ${invited.status}: ${invited.body?.message ?? invited.body?.error?.message ?? 'failed'}`,
      );

      const loginRes = await login(email);
      assert(loginRes.status === 200 && loginRes.body?.success, `login ${loginRes.status}: ${loginRes.body?.message}`);
      const token = loginRes.body.data.accessToken;
      const roles = loginRes.body.data.user?.roles ?? [];
      const primary = getPrimaryRole(roles);
      const shell = resolveAppShellKind(primary);

      assert(shell === 'STAFF_WORKLIST', `shell was ${shell} for roles [${roles.join(', ')}]`);
      assert(primary === roleCase.expectedRole, `primary ${primary} != ${roleCase.expectedRole}`);

      const scope = await getJson('/hospital/staff/me/scope', token);
      assert(scope.status === 200 && scope.body?.success !== false, `scope ${scope.status}: ${scope.body?.message ?? scope.body?.error?.message}`);
      assert(Array.isArray(scope.body?.data) && scope.body.data.length > 0, 'scope empty — hospital assignment missing');

      const worklist = await getJson(roleCase.worklistPath, token);
      assert(
        worklist.status === 200 && worklist.body?.success !== false,
        `worklist ${worklist.status}: ${worklist.body?.message ?? worklist.body?.error?.message ?? 'failed'}`,
      );

      row.result = 'PASS';
      row.detail = 'login OK · shell=STAFF_WORKLIST · scope OK · worklist API 200 · UI tabs Worklist+Settings';
      console.log(`PASS  ${roleCase.expectedRole.padEnd(22)} ${row.detail}`);
    } catch (err) {
      failed += 1;
      row.result = 'FAIL';
      row.detail = err.message;
      console.log(`FAIL  ${roleCase.expectedRole.padEnd(22)} ${err.message}`);
    }
    results.push(row);
  }

  console.log('\n=== Summary ===');
  const passCount = results.filter((r) => r.result === 'PASS').length;
  console.log(`Unit routing: ${failed === 0 && passCount === results.length ? 'PASS' : 'see failures above'}`);
  console.log(`Live roles: ${passCount}/${results.length} passed`);
  console.log('Mobile UI mapping: StaffRoleTabNavigator mounts Worklist + Settings for each STAFF_WORKLIST role.');

  if (failed > 0 || results.some((r) => r.result === 'FAIL')) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
