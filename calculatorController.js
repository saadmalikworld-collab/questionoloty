const { calculate } = require('../utils/calculationEngine');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const N = (v, d = 2) => (v == null ? '—' : parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
const P = (v) => (v == null ? '—' : (parseFloat(v) * 100).toFixed(2) + '%');

exports.runCalculation = async (req, res) => {
  try {
    const { country, inputs } = req.body;
    if (!country || !inputs) return res.status(400).json({ message: 'country and inputs required' });
    res.json(await calculate(country, inputs));
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.exportPDF = async (req, res) => {
  try {
    const { country, inputs, clientName, roleName } = req.body;
    const result = await calculate(country, inputs);
    const bd = result.breakdown;
    const cur = result.currency;

    const doc = new PDFDocument({ margin: 45, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Quoteology_${country.replace(/ /g,'_')}.pdf"`);
    doc.pipe(res);

    // ── Header bar ──
    doc.rect(0, 0, doc.page.width, 75).fill('#1e3a5f');
    doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('QUOTEOLOGY', 45, 18);
    doc.fontSize(11).font('Helvetica').text('Global Contractor Cost Breakdown Report', 45, 46);

    // ── Meta block ──
    let y = 92;
    const metaL = [
      ['Client', clientName || 'N/A'],
      ['Country', country],
      ['Currency', cur],
      ['Pay Basis', result.payFrequency],
    ];
    const metaR = [
      ['Role / Scenario', roleName || 'N/A'],
      ['Contractor Type', result.contractorType || 'N/A'],
      result.stateTerritory ? ['State/Territory', result.stateTerritory] : ['Report Date', new Date().toLocaleDateString('en-GB')],
      ['Report Date', new Date().toLocaleDateString('en-GB')],
    ];
    doc.fillColor('#333').fontSize(9.5);
    metaL.forEach(([k, v], i) => {
      doc.font('Helvetica-Bold').text(k + ':', 45, y + i * 16);
      doc.font('Helvetica').text(v, 135, y + i * 16);
    });
    metaR.forEach(([k, v], i) => {
      doc.font('Helvetica-Bold').text(k + ':', 310, y + i * 16);
      doc.font('Helvetica').text(v, 430, y + i * 16);
    });

    // ── Table ──
    y = 162;
    const W = doc.page.width - 90; // total table width
    const C1 = 45, C2 = 45 + W * 0.54, C3 = 45 + W * 0.74, C4 = 45 + W;

    // Table header
    doc.rect(45, y, W, 20).fill('#1e3a5f');
    doc.fillColor('white').fontSize(8.5).font('Helvetica-Bold');
    doc.text('Description',            C1 + 4,  y + 5);
    doc.text('Rate %',                 C2 + 4,  y + 5);
    doc.text(`Amount (${cur}/Day)`,    C3 + 4,  y + 5);
    y += 20;

    let rowNum = 0;
    const row = (label, rate, value, opts = {}) => {
      const h = 18;
      const bg = opts.isTotal ? '#1e3a5f' : opts.isSubtotal ? '#dbeafe' : (rowNum % 2 === 0 ? '#f8f9fa' : 'white');
      const tc = opts.isTotal ? 'white' : '#222';
      doc.rect(45, y, W, h).fill(bg);
      doc.fillColor(tc).fontSize(opts.isSubtotal || opts.isTotal ? 9 : 8.5);
      doc.font(opts.isSubtotal || opts.isTotal ? 'Helvetica-Bold' : 'Helvetica');
      const indent = opts.indent ? 14 : 0;
      doc.text(label, C1 + 4 + indent, y + 4, { width: C2 - C1 - 8, ellipsis: true });
      if (rate != null) doc.text(P(rate), C2 + 4, y + 4, { width: C3 - C2 - 8, align: 'right' });
      if (value != null) doc.text(N(value), C3 + 4, y + 4, { width: C4 - C3 - 8, align: 'right' });
      y += h; rowNum++;
    };

    row('Net Rate to Man', bd.netRateToMan.rate, bd.netRateToMan.value);
    if (bd.ssEmployee?.value)  row(bd.ssEmployee.label,  bd.ssEmployee.rate,  bd.ssEmployee.value,  { indent: true });
    if (bd.pitTopRate)         row(bd.pitTopRate.label,  bd.pitTopRate.rate,  bd.pitTopRate.value,  { indent: true });
    if (bd.surcharge)          row(bd.surcharge.label,   bd.surcharge.rate,   bd.surcharge.value,   { indent: true });
    if (bd.edCess)             row(bd.edCess.label,      bd.edCess.rate,      bd.edCess.value,      { indent: true });
    if (bd.topRateTax)         row(bd.topRateTax.label,  bd.topRateTax.rate,  bd.topRateTax.value,  { indent: true });
    row('Gross Rate to Man', null, bd.grossRateToMan.value, { isSubtotal: true });

    if (bd.salarySplit) bd.salarySplit.forEach(s => row(s.label, s.rate, s.value, { indent: true }));

    row('In-Country Burdens (Total)', null, bd.burdens.total);
    bd.burdens.items.forEach(it => { if (it.value !== 0) row(it.label, it.rate, it.value, { indent: true }); });

    row('Gross Rate Post Employer Burdens', null, bd.grossRatePostBurdens.value, { isSubtotal: true });
    row('Quoteology Fee', bd.quoteologyFee.rate, bd.quoteologyFee.value, { indent: true });
    row('Invoice Value Pre Tax', null, bd.invoicePreTax.value, { isSubtotal: true });
    row(`${bd.tax.label} (${P(bd.tax.rate)})`, bd.tax.rate, bd.tax.value, { indent: true });
    row('Invoice Value Post Tax', null, bd.invoicePostTax.value, { isTotal: true });

    // ── Multiplier footer ──
    y += 8;
    doc.rect(45, y, W, 36).fill('#eef6fd');
    doc.fillColor('#1e3a5f').fontSize(9.5).font('Helvetica-Bold');
    doc.text('Multiplier (Pre-Tax):', 55, y + 7);
    doc.fillColor('#333').font('Helvetica').text(`${result.multiplierPreTax}x`, 175, y + 7);
    doc.fillColor('#1e3a5f').font('Helvetica-Bold').text('Multiplier (Post-Tax):', 280, y + 7);
    doc.fillColor('#333').font('Helvetica').text(`${result.multiplierPostTax}x`, 410, y + 7);
    doc.fillColor('#1e3a5f').font('Helvetica-Bold').text('Bill Rate / Day:', 55, y + 22);
    doc.fillColor('#333').font('Helvetica').text(`${cur} ${N(result.billRatePerDay)}`, 175, y + 22);

    // Footer
    doc.fillColor('#aaa').fontSize(7.5).text('Generated by Quoteology  |  Confidential', 45, doc.page.height - 28, { align: 'center', width: W });
    doc.end();
  } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};

exports.exportExcel = async (req, res) => {
  try {
    const { country, inputs, clientName, roleName } = req.body;
    const result = await calculate(country, inputs);
    const bd = result.breakdown;
    const cur = result.currency;

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Quoteology';
    const ws = wb.addWorksheet('Cost Breakdown');
    ws.columns = [{ key:'a', width:50 }, { key:'b', width:16 }, { key:'c', width:22 }];

    const DARK  = { type:'pattern', pattern:'solid', fgColor:{ argb:'FF1e3a5f' } };
    const BLUE  = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFdbeafe' } };
    const EVEN  = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFf8f9fa' } };
    const WHITE = { type:'pattern', pattern:'solid', fgColor:{ argb:'FFFFFFFF' } };
    const WHITE_FONT = { color:{ argb:'FFFFFFFF' }, bold:true, size:11 };
    const DARK_FONT  = { color:{ argb:'FF1e3a5f' }, bold:true };

    // Title
    ws.mergeCells('A1:C1');
    const t = ws.getRow(1);
    t.getCell(1).value = 'QUOTEOLOGY — Cost Breakdown Report';
    t.getCell(1).style = { font:{ ...WHITE_FONT, size:14 }, fill:DARK, alignment:{ vertical:'middle', horizontal:'left' } };
    t.height = 28;

    // Meta rows
    const meta = [
      [`Client: ${clientName || 'N/A'}`, '', `Role: ${roleName || 'N/A'}`],
      [`Country: ${country}`,            '', `Currency: ${cur}`],
      [`Pay Basis: ${result.payFrequency}`, '', `Contractor Type: ${result.contractorType || 'N/A'}`],
      [result.stateTerritory ? `State/Territory: ${result.stateTerritory}` : '', '', `Date: ${new Date().toLocaleDateString('en-GB')}`],
    ];
    meta.forEach((m, i) => {
      const r = ws.getRow(i + 2);
      r.getCell(1).value = m[0]; r.getCell(1).font = { bold:true };
      r.getCell(3).value = m[2]; r.getCell(3).font = { bold:true };
    });

    // Table header row
    const th = ws.getRow(7);
    th.values = ['Description', 'Rate %', `Amount (${cur}/Day)`];
    th.eachCell(c => { c.style = { font:WHITE_FONT, fill:DARK, alignment:{ horizontal:'left' } }; });
    th.height = 20;

    let ri = 8;
    let idx = 0;
    const addRow = (label, rate, value, isSubtotal, isTotal, indent) => {
      const r = ws.getRow(ri++);
      r.getCell(1).value = (indent ? '    ' : '') + label;
      if (rate != null) { r.getCell(2).value = parseFloat((rate * 100).toFixed(4)); r.getCell(2).numFmt = '0.00"%"'; }
      if (value != null) { r.getCell(3).value = parseFloat(parseFloat(value).toFixed(6)); r.getCell(3).numFmt = '#,##0.0000'; }
      const fill = isTotal ? DARK : isSubtotal ? BLUE : (idx % 2 === 0 ? EVEN : WHITE);
      const font = isTotal ? WHITE_FONT : isSubtotal ? DARK_FONT : { size:10 };
      r.eachCell(c => { c.style = { fill, font, alignment:{ horizontal: c._column.key === 'a' ? 'left' : 'right' } }; });
      idx++;
    };

    addRow('Net Rate to Man', null, bd.netRateToMan.value);
    if (bd.ssEmployee?.value) addRow(bd.ssEmployee.label, bd.ssEmployee.rate, bd.ssEmployee.value, false, false, true);
    if (bd.pitTopRate)        addRow(bd.pitTopRate.label, bd.pitTopRate.rate, bd.pitTopRate.value, false, false, true);
    if (bd.surcharge)         addRow(bd.surcharge.label,  bd.surcharge.rate,  bd.surcharge.value,  false, false, true);
    if (bd.edCess)            addRow(bd.edCess.label,     bd.edCess.rate,     bd.edCess.value,     false, false, true);
    if (bd.topRateTax)        addRow(bd.topRateTax.label, bd.topRateTax.rate, bd.topRateTax.value, false, false, true);
    addRow('Gross Rate to Man', null, bd.grossRateToMan.value, true);

    if (bd.salarySplit) bd.salarySplit.forEach(s => addRow(s.label, s.rate, s.value, false, false, true));

    addRow('In-Country Burdens', null, bd.burdens.total);
    bd.burdens.items.forEach(it => { if (it.value !== 0) addRow(it.label, it.rate, it.value, false, false, true); });

    addRow('Gross Rate Post Employer Burdens', null, bd.grossRatePostBurdens.value, true);
    addRow('Quoteology Fee', bd.quoteologyFee.rate, bd.quoteologyFee.value, false, false, true);
    addRow('Invoice Value Pre Tax', null, bd.invoicePreTax.value, true);
    addRow(bd.tax.label, bd.tax.rate, bd.tax.value, false, false, true);
    addRow('Invoice Value Post Tax', null, bd.invoicePostTax.value, false, true);

    ri++;
    const mulRow = ws.getRow(ri++);
    mulRow.getCell(1).value = 'Multiplier (Pre-Tax):';  mulRow.getCell(1).font = DARK_FONT;
    mulRow.getCell(2).value = result.multiplierPreTax;
    mulRow.getCell(3).value = `Post-Tax: ${result.multiplierPostTax}x`;
    mulRow.getCell(3).font = DARK_FONT;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Quoteology_${country.replace(/ /g,'_')}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (e) { console.error(e); res.status(500).json({ message: e.message }); }
};
