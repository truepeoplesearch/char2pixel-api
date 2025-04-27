const conversionConfig = require('../config/conversionConfig');
const unicodeService = require('../services/unicodeService');

/**
 * Applies the custom transformation with parameters to an ASCII code
 * @param {number} asciiCode - The ASCII code
 * @param {string} color - The color component ('cyan', 'magenta', 'yellow', 'black')
 * @returns {number} - Transformed value between 0 and 1
 */
function applyTransformation(asciiCode, color) {
    try {
        const { weights, offsets, scaling } = conversionConfig.parameters;
        const transform = conversionConfig.transformations[color];
        
        if (!transform) {
            throw new Error(`Invalid color component: ${color}`);
        }
        
        // Apply the transformation
        let value = transform(asciiCode);
        
        // Apply scaling
        value *= scaling[color];
        
        // Apply offset and normalize
        value = (value + offsets[color]) / 255;
        
        // Apply weight
        value *= weights[color];
        
        // Ensure value is between 0 and 1
        return Math.max(0, Math.min(1, value));
    } catch (error) {
        console.error(`Error in color transformation for ${color}:`, error);
        return 0; // Return black as fallback
    }
}

/**
 * Determines the character type based on Unicode category
 * @param {Object} charInfo - Character information from Unicode service
 * @returns {string} - The character type
 */
function getCharacterType(charInfo) {
    if (!charInfo) return 'unknown';
    
    const category = charInfo.category;
    if (category.startsWith('Ll')) return 'lowercase';
    if (category.startsWith('Lu')) return 'uppercase';
    if (category.startsWith('Nd')) return 'number';
    if (category.startsWith('Lo')) return 'other_letter';
    return 'other';
}

/**
 * Converts an ASCII code to CMYK color values using custom parameters
 * @param {number} asciiCode - The ASCII code of the character
 * @returns {Promise<Object>} CMYK color values and character information
 */
async function asciiToCMYK(asciiCode) {
    try {
        // Ensure the ASCII code is within valid range
        const normalizedCode = Math.max(0, Math.min(0x10FFFF, asciiCode));
        
        // Initialize Unicode service if needed
        if (!unicodeService.initialized) {
            await unicodeService.initialize();
        }
        
        // Get character information from Unicode service
        const charInfo = await unicodeService.getCharacterInfo(normalizedCode);
        const characterType = getCharacterType(charInfo);
        
        // Apply transformations for each color component
        const c = applyTransformation(normalizedCode, 'cyan');
        const m = applyTransformation(normalizedCode, 'magenta');
        const y = applyTransformation(normalizedCode, 'yellow');
        const k = applyTransformation(normalizedCode, 'black');
        
        return {
            cmyk: {
                c: Math.round(c * 100) / 100,
                m: Math.round(m * 100) / 100,
                y: Math.round(y * 100) / 100,
                k: Math.round(k * 100) / 100
            },
            characterInfo: {
                type: characterType,
                code: normalizedCode,
                unicode: `U+${normalizedCode.toString(16).toUpperCase()}`,
                ...(charInfo ? {
                    character: charInfo.character,
                    name: charInfo.name,
                    block: charInfo.block,
                    category: charInfo.category
                } : {})
            }
        };
    } catch (error) {
        console.error('Error in asciiToCMYK:', error);
        throw error; // Re-throw to be handled by the route
    }
}

module.exports = {
    asciiToCMYK
}; 