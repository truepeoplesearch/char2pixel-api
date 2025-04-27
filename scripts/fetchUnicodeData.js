const fs = require('fs');
const path = require('path');
const https = require('https');
const parquet = require('parquetjs');

const UNICODE_DATA_URL = 'https://www.unicode.org/Public/15.1.0/ucd/UnicodeData.txt';
const DATA_DIR = path.join(__dirname, '..', 'data');
const PARQUET_FILE = path.join(DATA_DIR, 'unicode_data.parquet');

// Define the schema for our Parquet file
const schema = new parquet.ParquetSchema({
    code: { type: 'INT32' },
    character: { type: 'UTF8' },
    name: { type: 'UTF8' },
    block: { type: 'UTF8' },
    category: { type: 'UTF8' },
    bidirectional: { type: 'UTF8' },
    combining: { type: 'INT32' },
    mirrored: { type: 'BOOLEAN' }
});

// Create a Parquet writer
async function createParquetWriter() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return await parquet.ParquetWriter.openFile(schema, PARQUET_FILE);
}

// Download Unicode data
function downloadUnicodeData() {
    return new Promise((resolve, reject) => {
        https.get(UNICODE_DATA_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Parse Unicode data
function parseUnicodeData(data) {
    const lines = data.split('\n');
    const records = [];

    for (const line of lines) {
        if (!line.trim()) continue;

        const fields = line.split(';');
        if (fields.length < 15) continue;

        const [code, name, category, combining, bidirectional, mirrored] = fields;

        // Skip control characters and surrogates
        if (category === 'Cc' || category === 'Cs' || category === 'Co') continue;

        // Determine block based on code point
        let block = 'Unknown';
        const codePoint = parseInt(code, 16);
        if (codePoint >= 0x0000 && codePoint <= 0x007F) block = 'Basic Latin';
        else if (codePoint >= 0x0080 && codePoint <= 0x00FF) block = 'Latin-1 Supplement';
        else if (codePoint >= 0x0900 && codePoint <= 0x097F) block = 'Devanagari';

        records.push({
            code: codePoint,
            character: String.fromCodePoint(codePoint),
            name: name,
            block: block,
            category: category,
            bidirectional: bidirectional,
            combining: parseInt(combining),
            mirrored: mirrored === 'Y'
        });
    }

    return records;
}

// Main function
async function main() {
    try {
        console.log('Downloading Unicode data...');
        const data = await downloadUnicodeData();
        console.log('Parsing Unicode data...');
        const records = parseUnicodeData(data);

        console.log('Creating Parquet file...');
        const writer = await createParquetWriter();

        console.log('Writing records...');
        for (const record of records) {
            await writer.appendRow(record);
        }

        await writer.close();
        console.log(`Successfully created Parquet file at ${PARQUET_FILE}`);
        console.log(`Processed ${records.length} Unicode characters`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main(); 