const fs = require('fs');
const path = require('path');

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5263';

const envProdPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

let content = fs.readFileSync(envProdPath, 'utf8');
content = content.replace('{{API_BASE_URL}}', apiBaseUrl);

fs.writeFileSync(envProdPath, content);

console.log(`Set API_BASE_URL to ${apiBaseUrl}`);