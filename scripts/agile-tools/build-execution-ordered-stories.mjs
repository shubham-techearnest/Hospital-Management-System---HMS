/**
 * Create execution-ordered copy of Health360_Complete_User_Stories.xlsx
 * Sort: dependency-safe module sequence → status (plan-friendly) → Story ID
 * Does not put later-wave modules before foundation (avoids bridging deps).
 */
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '../../docs/ssot/Health360_Complete_User_Stories.xlsx');
const OUT = path.resolve(
  __dirname,
  '../../docs/ssot/Health360_Complete_User_Stories_Execution_Ordered.xlsx',
);

/**
 * Module order = execution flow (foundation → clinical core → ancillaries →
 * revenue → ops → intelligence → mobile/analytics → vision last).
 * Matches agile roadmap + WF dependency chains.
 */
const MODULE_ORDER = [
  'IAM',
  'Security',
  'Platform',
  'Platform Admin',
  'Public',
  'Hospital Org',
  'Subscriptions',
  'Partners',
  'Patient',
  'Doctor',
  'Search',
  'Scheduling',
  'Reception',
  'OPD',
  'Clinical',
  'Laboratory',
  'Radiology',
  'Pharmacy',
  'OT',
  'IPD',
  'ICU',
  'Nursing',
  'Emergency',
  'Billing',
  'Insurance',
  'Inventory',
  'Procurement',
  'Assets',
  'Facility',
  'Blood Bank',
  'Staff Ops',
  'Automation',
  'Command Center',
  'Predictive',
  'Notifications',
  'Reviews',
  'Analytics',
  'Mobile',
  'Cross-Module Journeys',
  'Vision Products',
];

/**
 * Status order within a module for execution planning:
 * finish what exists → close partials → verify unknowns → planned → not started.
 */
const STATUS_ORDER = [
  'IMPLEMENTED',
  'PARTIALLY IMPLEMENTED',
  'IN DEVELOPMENT',
  'UNKNOWN',
  'BLOCKED',
  'PLANNED',
  'NOT STARTED',
];

/** Roadmap wave for filtering / grouping (added as helper columns). */
function waveFor(module, status) {
  if (module === 'Vision Products' || status === 'NOT STARTED') return '08 — Future Expansion';
  if (['IAM', 'Security', 'Platform'].includes(module) && status === 'IMPLEMENTED') {
    return '01 — Baseline';
  }
  if (
    status === 'PARTIALLY IMPLEMENTED' &&
    ['IAM', 'Security', 'Billing', 'Command Center', 'Platform Admin', 'Public'].includes(module)
  ) {
    return '02 — Stabilization / Core Completion';
  }
  if (
    [
      'Patient',
      'Doctor',
      'Reception',
      'OPD',
      'Clinical',
      'Laboratory',
      'IPD',
      'Nursing',
      'Billing',
      'Hospital Org',
      'Scheduling',
      'Search',
      'Public',
      'Platform Admin',
    ].includes(module) &&
    status === 'IMPLEMENTED'
  ) {
    return '01 — Baseline';
  }
  if (status === 'PARTIALLY IMPLEMENTED') return '03 — Core Workflow Completion';
  if (status === 'UNKNOWN' || status === 'IN DEVELOPMENT') return '04 — Module Completion';
  if (['Automation', 'Command Center', 'Cross-Module Journeys'].includes(module)) {
    return '05 — Integration';
  }
  if (['Notifications', 'Security'].includes(module) && status !== 'IMPLEMENTED') {
    return '06 — Hardening';
  }
  if (status === 'PLANNED') return '07 — Release Prep / Planned';
  return '04 — Module Completion';
}

function idx(list, value, fallback = 999) {
  const i = list.indexOf(value);
  return i === -1 ? fallback : i;
}

async function main() {
  const wbIn = new ExcelJS.Workbook();
  await wbIn.xlsx.readFile(SRC);
  const wsIn = wbIn.worksheets[0];

  const headers = [];
  wsIn.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
    headers[col - 1] = String(cell.value ?? '');
  });

  const col = (name) => headers.indexOf(name);
  const iModule = col('Module');
  const iStatus = col('Implementation Status');
  const iId = col('Story ID');
  if (iModule < 0 || iStatus < 0 || iId < 0) {
    throw new Error('Required columns missing in source workbook');
  }

  const rows = [];
  for (let r = 2; r <= wsIn.rowCount; r++) {
    const row = wsIn.getRow(r);
    const values = [];
    for (let c = 1; c <= headers.length; c++) {
      values.push(row.getCell(c).value);
    }
    if (!values[iId]) continue;
    rows.push(values);
  }

  // Primary: dependency-safe module order (plan execution flow).
  // Secondary: status within module (implemented → partial → unknown → planned → not started).
  // Does NOT sort by wave first — that would split a module and bridge deps across modules.
  rows.sort((a, b) => {
    const modA = String(a[iModule] ?? '');
    const modB = String(b[iModule] ?? '');
    const stA = String(a[iStatus] ?? '');
    const stB = String(b[iStatus] ?? '');
    const idA = String(a[iId] ?? '');
    const idB = String(b[iId] ?? '');

    const mo = idx(MODULE_ORDER, modA) - idx(MODULE_ORDER, modB);
    if (mo !== 0) return mo;

    const so = idx(STATUS_ORDER, stA) - idx(STATUS_ORDER, stB);
    if (so !== 0) return so;

    return idA.localeCompare(idB);
  });

  const outHeaders = [
    'Execution Seq',
    'Execution Wave',
    'Module Seq',
    'Status Seq',
    ...headers,
  ];

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Health360 Agile Reconstruction';
  wb.created = new Date();
  const ws = wb.addWorksheet('Complete User Stories', {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { defaultRowHeight: 45 },
  });

  const widths = [12, 28, 10, 10].concat(
    headers.map((_, i) =>
      [14, 22, 16, 18, 18, 48, 28, 28, 28, 22, 40, 28, 28, 40, 32, 28, 28, 28, 24, 24, 20, 22, 20, 20, 18, 14, 18, 36, 24][
        i
      ] ?? 20,
    ),
  );
  ws.columns = outHeaders.map((h, i) => ({ header: h, key: `c${i}`, width: widths[i] }));

  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });

  const STATUS_FILL = {
    IMPLEMENTED: 'C6EFCE',
    'PARTIALLY IMPLEMENTED': 'FFEB9C',
    'IN DEVELOPMENT': 'BDD7EE',
    PLANNED: 'DDEBF7',
    'NOT STARTED': 'F2F2F2',
    BLOCKED: 'FFC7CE',
    UNKNOWN: 'E2D5F1',
  };
  const PRIORITY_FILL = {
    'P0 — Critical': 'FFC7CE',
    'P1 — High': 'FCE4D6',
    'P2 — Medium': 'FFF2CC',
    'P3 — Future': 'E2EFDA',
  };

  let seq = 0;
  for (const values of rows) {
    seq += 1;
    const module = String(values[iModule] ?? '');
    const status = String(values[iStatus] ?? '');
    const wave = waveFor(module, status);
    const moduleSeq = idx(MODULE_ORDER, module) + 1;
    const statusSeq = idx(STATUS_ORDER, status) + 1;

    const outValues = [seq, wave, moduleSeq, statusSeq, ...values];
    const row = ws.addRow(outValues);
    row.alignment = { vertical: 'top', wrapText: true };

    // Status / Priority are shifted by +4
    const statusCell = row.getCell(4 + iStatus + 1);
    const priCell = row.getCell(4 + col('Priority') + 1);
    const sf = STATUS_FILL[status];
    if (sf) statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + sf } };
    const pf = PRIORITY_FILL[String(values[col('Priority')] ?? '')];
    if (pf) priCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + pf } };

    if (seq % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber === 4 + iStatus + 1 || colNumber === 4 + col('Priority') + 1) return;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FC' } };
      });
    }
  }

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: rows.length + 1, column: outHeaders.length },
  };

  const statusCol = 4 + iStatus + 1;
  const priCol = 4 + col('Priority') + 1;
  for (let i = 2; i <= rows.length + 1; i++) {
    ws.getCell(i, priCol).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"P0 — Critical,P1 — High,P2 — Medium,P3 — Future"'],
    };
    ws.getCell(i, statusCol).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [
        '"IMPLEMENTED,PARTIALLY IMPLEMENTED,IN DEVELOPMENT,PLANNED,NOT STARTED,BLOCKED,UNKNOWN"',
      ],
    };
  }

  // Sort key legend as second sheet? User asked for copy of sheet — keep ONE sheet only to match master rule.
  await wb.xlsx.writeFile(OUT);

  console.log(`Wrote ${OUT}`);
  console.log(`Rows: ${rows.length}; Sheets: ${wb.worksheets.length}`);
  console.log('Sort keys: Module Seq (deps-safe) → Status Seq → Story ID');
  console.log('Module order (first 12):', MODULE_ORDER.slice(0, 12).join(' → '));
  console.log('Status order:', STATUS_ORDER.join(' → '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
