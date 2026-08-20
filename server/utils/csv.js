function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  let str = String(val);
  // Neutralize CSV / Excel formula injection characters
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCsvRow(values) {
  return values.map(escapeCsv).join(',');
}

function sendCsv(res, filename, headerRow, dataRows) {
  const csv = [headerRow, ...dataRows].join('\r\n') + '\r\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
}

module.exports = { escapeCsv, toCsvRow, sendCsv };
