/**
 * Health360 — Complete User Stories Excel generator
 * Evidence-based backlog: code/API/DB/UI first; vision items marked PLANNED/NOT STARTED.
 * Output: docs/ssot/Health360_Complete_User_Stories.xlsx (single sheet)
 */
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stories } from './stories-inventory.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../../docs/ssot/Health360_Complete_User_Stories.xlsx');

const HEADERS = [
  'Story ID',
  'Epic',
  'Module',
  'Sub-Module',
  'Persona / Actor',
  'User Story',
  'Business Objective',
  'Business Requirement',
  'Preconditions',
  'Trigger',
  'Main Flow',
  'Alternate Flow',
  'Exception Flow',
  'Acceptance Criteria',
  'Business Rules',
  'Validation Rules',
  'Data Created / Updated',
  'API / Backend Dependency',
  'Database Dependency',
  'Web Dependency',
  'Mobile Dependency',
  'Notification Requirement',
  'Audit Requirement',
  'Integration Dependency',
  'Dependency Story IDs',
  'Priority',
  'Implementation Status',
  'Source Evidence',
  'Notes',
];

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

function validate(rows) {
  const ids = new Set();
  const errors = [];
  for (const r of rows) {
    if (!r.id) errors.push('Missing Story ID');
    if (ids.has(r.id)) errors.push(`Duplicate ID: ${r.id}`);
    ids.add(r.id);
    if (!r.story || !r.story.startsWith('As a')) errors.push(`${r.id}: invalid User Story format`);
    if (!r.actor) errors.push(`${r.id}: missing actor`);
    if (!r.ac) errors.push(`${r.id}: missing AC`);
    if (!r.status) errors.push(`${r.id}: missing status`);
    if ((r.status === 'IMPLEMENTED' || r.status === 'PARTIALLY IMPLEMENTED') && !r.evidence) {
      errors.push(`${r.id}: implemented/partial requires evidence`);
    }
  }
  if (errors.length) {
    console.error('VALIDATION FAILURES:', errors.slice(0, 40));
    if (errors.length > 40) console.error(`…and ${errors.length - 40} more`);
    process.exit(1);
  }
  return ids.size;
}

async function main() {
  const rows = stories();
  console.log(`Stories generated: ${rows.length}`);
  validate(rows);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Health360 Agile Reconstruction';
  wb.created = new Date();
  const ws = wb.addWorksheet('Complete User Stories', {
    views: [{ state: 'frozen', ySplit: 1 }],
    properties: { defaultRowHeight: 45 },
  });

  ws.columns = HEADERS.map((h, i) => ({
    header: h,
    key: `c${i}`,
    width: [14, 22, 16, 18, 18, 48, 28, 28, 28, 22, 40, 28, 28, 40, 32, 28, 28, 28, 24, 24, 20, 22, 20, 20, 18, 14, 18, 36, 24][i],
  }));

  const header = ws.getRow(1);
  header.height = 28;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF9BC2E6' } },
      bottom: { style: 'thin', color: { argb: 'FF9BC2E6' } },
      left: { style: 'thin', color: { argb: 'FF9BC2E6' } },
      right: { style: 'thin', color: { argb: 'FF9BC2E6' } },
    };
  });

  for (const r of rows) {
    const values = [
      r.id,
      r.epic,
      r.module,
      r.subModule,
      r.actor,
      r.story,
      r.objective,
      r.requirement,
      r.preconditions,
      r.trigger,
      r.mainFlow,
      r.alternateFlow,
      r.exceptionFlow,
      r.ac,
      r.rules,
      r.validation,
      r.data,
      r.api,
      r.db,
      r.web,
      r.mobile,
      r.notification,
      r.audit,
      r.integration,
      r.deps,
      r.priority,
      r.status,
      r.evidence,
      r.notes,
    ];
    const row = ws.addRow(values);
    row.alignment = { vertical: 'top', wrapText: true };
    const statusCell = row.getCell(27);
    const priCell = row.getCell(26);
    const sf = STATUS_FILL[r.status];
    if (sf) statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + sf } };
    const pf = PRIORITY_FILL[r.priority];
    if (pf) priCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + pf } };
    if (row.number % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell, col) => {
        if (col === 26 || col === 27) return;
        if (!cell.fill || cell.fill.fgColor?.argb === undefined) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FC' } };
        }
      });
    }
  }

  // Excel Table
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: rows.length + 1, column: HEADERS.length },
  };

  // Data validations
  for (let i = 2; i <= rows.length + 1; i++) {
    ws.getCell(i, 26).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"P0 — Critical,P1 — High,P2 — Medium,P3 — Future"'],
    };
    ws.getCell(i, 27).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [
        '"IMPLEMENTED,PARTIALLY IMPLEMENTED,IN DEVELOPMENT,PLANNED,NOT STARTED,BLOCKED,UNKNOWN"',
      ],
    };
  }

  await wb.xlsx.writeFile(OUT);
  console.log(`Wrote ${OUT}`);
  console.log(`Sheet count: ${wb.worksheets.length}`);
  const byStatus = {};
  for (const r of rows) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  console.log('By status:', byStatus);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
