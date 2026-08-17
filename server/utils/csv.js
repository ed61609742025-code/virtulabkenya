function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
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
