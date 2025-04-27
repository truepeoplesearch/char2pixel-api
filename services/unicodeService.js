const parquet = require('parquetjs');
const path = require('path');
const fs = require('fs');

class UnicodeService {
    constructor() {
        this.parquetFile = null;
        this.initialized = false;
        this.dataDir = path.join(__dirname, '..', 'data');
        this.parquetFilePath = path.join(this.dataDir, 'unicode_data.parquet');
    }

    async initialize() {
        try {
            if (fs.existsSync(this.parquetFilePath)) {
                this.parquetFile = await parquet.ParquetReader.openFile(this.parquetFilePath);
                this.initialized = true;
                console.log('Unicode service initialized successfully');
            } else {
                console.warn('Unicode data file not found. Please run "npm run fetch-unicode" to fetch the data.');
            }
        } catch (error) {
            console.error('Error initializing Unicode service:', error);
            this.initialized = false;
        }
    }

    async getCharacterInfo(code) {
        if (!this.initialized) {
            await this.initialize();
        }

        // Convert code to number if it's a string
        const codeNum = typeof code === 'string' ? parseInt(code, 16) : parseInt(code);
        
        if (isNaN(codeNum)) {
            throw new Error('Invalid character code');
        }

        // If Parquet file is not available, return basic info
        if (!this.parquetFile) {
            return this.getBasicCharacterInfo(codeNum);
        }

        try {
            const cursor = this.parquetFile.getCursor();
            let record = null;

            while (record = await cursor.next()) {
                if (record.code === codeNum) {
                    return {
                        code: record.code,
                        character: record.character,
                        name: record.name,
                        block: record.block,
                        category: record.category,
                        bidirectional: record.bidirectional,
                        combining: record.combining,
                        mirrored: record.mirrored
                    };
                }
            }

            return this.getBasicCharacterInfo(codeNum);
        } catch (error) {
            console.error('Error reading character info:', error);
            return this.getBasicCharacterInfo(codeNum);
        }
    }

    getBasicCharacterInfo(code) {
        // Provide basic character info when Parquet file is not available
        let category = 'other';
        if (code >= 97 && code <= 122) category = 'Ll'; // lowercase
        else if (code >= 65 && code <= 90) category = 'Lu'; // uppercase
        else if (code >= 48 && code <= 57) category = 'Nd'; // English number
        else if (code >= 0x0966 && code <= 0x096F) category = 'Nd'; // Marathi number
        else if (code >= 0x0900 && code <= 0x097F) category = 'Lo'; // Devanagari

        return {
            code: code,
            character: String.fromCharCode(code),
            name: this.getCharacterName(code),
            block: this.getBlockFromCode(code),
            category: category
        };
    }

    getCharacterName(code) {
        if (code >= 48 && code <= 57) {
            return `DIGIT ${code - 48}`;
        } else if (code >= 0x0966 && code <= 0x096F) {
            return `DEVANAGARI DIGIT ${code - 0x0966}`;
        }
        return `Character ${code}`;
    }

    getBlockFromCode(code) {
        if (code >= 0x0000 && code <= 0x007F) return 'Basic Latin';
        if (code >= 0x0080 && code <= 0x00FF) return 'Latin-1 Supplement';
        if (code >= 0x0900 && code <= 0x097F) return 'Devanagari';
        return 'Unknown';
    }

    async getBlockInfo(blockName) {
        if (!this.initialized) {
            await this.initialize();
        }

        // If Parquet file is not available, return empty array
        if (!this.parquetFile) {
            console.log('Parquet file not available. Please run "npm run fetch-unicode" to fetch Unicode data.');
            return [];
        }

        try {
            const cursor = this.parquetFile.getCursor();
            const characters = [];

            while (record = await cursor.next()) {
                if (record.block === blockName) {
                    characters.push({
                        code: record.code,
                        character: record.character,
                        name: record.name
                    });
                }
            }

            return characters;
        } catch (error) {
            console.error('Error reading block info:', error);
            return [];
        }
    }

    async close() {
        if (this.parquetFile) {
            await this.parquetFile.close();
            this.initialized = false;
        }
    }
}

module.exports = new UnicodeService(); 