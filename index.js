const express = require('express');
const cors = require('cors');
const { asciiToCMYK } = require('./utils/colorConverter');
const unicodeService = require('./services/unicodeService');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Unicode service
unicodeService.initialize().catch(console.error);

// Routes
app.get('/api/char/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const charInfo = await unicodeService.getCharacterInfo(code);
        res.json(charInfo);
    } catch (error) {
        if (error.message === 'Invalid character code') {
            return res.status(400).json({
                error: 'Invalid character code. Please provide a valid hexadecimal or decimal code.'
            });
        }
        console.error('Error fetching character info:', error);
        res.status(500).json({
            error: 'An error occurred while fetching character information.'
        });
    }
});

app.get('/api/ascii-to-cmyk/:code', async (req, res) => {
    try {
        const asciiCode = parseInt(req.params.code);
        
        if (isNaN(asciiCode)) {
            return res.status(400).json({
                error: 'Invalid code. Please provide a valid number.'
            });
        }
        
        const result = await asciiToCMYK(asciiCode);
        res.json(result);
    } catch (error) {
        console.error('Error converting ASCII to CMYK:', error);
        res.status(500).json({
            error: 'An error occurred while processing your request.'
        });
    }
});

// Example characters endpoint
app.get('/api/examples', async (req, res) => {
    try {
        const examples = {
            lowercase: {
                character: 'a',
                code: 97,
                result: await asciiToCMYK(97)
            },
            uppercase: {
                character: 'A',
                code: 65,
                result: await asciiToCMYK(65)
            },
            number: {
                character: '1',
                code: 49,
                result: await asciiToCMYK(49)
            },
            marathi: {
                character: 'अ',
                code: 0x0905,
                result: await asciiToCMYK(0x0905)
            }
        };
        
        res.json(examples);
    } catch (error) {
        console.error('Error fetching examples:', error);
        res.status(500).json({
            error: 'An error occurred while fetching examples.'
        });
    }
});

// Get Unicode block information
app.get('/api/block/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const characters = await unicodeService.getBlockInfo(name);
        res.json(characters);
    } catch (error) {
        console.error('Error fetching block information:', error);
        res.status(500).json({
            error: 'An error occurred while fetching block information.'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'An unexpected error occurred.'
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await unicodeService.close();
    process.exit(0);
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 