const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = xlsx.readFile('CO.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

const result = {};

for (const row of data) {
  if (row.Score && (row['1st Dart'] || row['2nd Dart'] || row['3rd Dart'])) {
    const darts = [];
    if (row['1st Dart']) darts.push(String(row['1st Dart']).trim());
    if (row['2nd Dart']) darts.push(String(row['2nd Dart']).trim());
    if (row['3rd Dart']) darts.push(String(row['3rd Dart']).trim());
    
    if (darts.length > 0) {
      result[row.Score] = darts;
    }
  }
}

const outputPath = path.join(__dirname, 'bundles', 'dart-scoreboard', 'graphics', 'checkout.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log('Successfully wrote to ' + outputPath);
