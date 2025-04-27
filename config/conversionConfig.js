/**
 * Configuration for ASCII to CMYK conversion with special handling for different character types
 */
const conversionConfig = {
    // Base parameters for conversion
    parameters: {
        weights: {
            cyan: 1.0,
            magenta: 1.0,
            yellow: 1.0,
            black: 1.0
        },
        offsets: {
            cyan: 0,
            magenta: 0,
            yellow: 0,
            black: 0
        },
        scaling: {
            cyan: 1.0,
            magenta: 1.0,
            yellow: 1.0,
            black: 1.0
        }
    },
    
    // Character type detection
    isLowerCase: (code) => code >= 97 && code <= 122,
    isUpperCase: (code) => code >= 65 && code <= 90,
    isEnglishNumber: (code) => code >= 48 && code <= 57,
    isMarathiNumber: (code) => code >= 0x0966 && code <= 0x096F,
    isMarathi: (code) => code >= 0x0900 && code <= 0x097F,
    
    // Custom transformation functions for each color component
    transformations: {
        cyan: (asciiCode) => {
            try {
                if (conversionConfig.isLowerCase(asciiCode)) {
                    // For lowercase letters (a-z), create a smooth gradient
                    return (asciiCode - 97) / 25; // Will give 0 for 'a', 1 for 'z'
                }
                if (conversionConfig.isEnglishNumber(asciiCode)) {
                    // For English numbers (0-9), create a linear gradient
                    return (asciiCode - 48) / 9; // Will give 0 for '0', 1 for '9'
                }
                if (conversionConfig.isMarathiNumber(asciiCode)) {
                    // For Marathi numbers (०-९), create a linear gradient
                    return (asciiCode - 0x0966) / 9; // Will give 0 for '०', 1 for '९'
                }
                return asciiCode / 255;
            } catch (error) {
                console.error('Error in cyan transformation:', error);
                return 0;
            }
        },
        
        magenta: (asciiCode) => {
            try {
                if (conversionConfig.isUpperCase(asciiCode)) {
                    // For uppercase letters (A-Z), create an inverse gradient
                    return 1 - ((asciiCode - 65) / 25); // Will give 1 for 'A', 0 for 'Z'
                }
                if (conversionConfig.isEnglishNumber(asciiCode)) {
                    // For English numbers (0-9), create a wave pattern
                    return Math.sin((asciiCode - 48) * Math.PI / 5); // Creates a wave pattern
                }
                if (conversionConfig.isMarathiNumber(asciiCode)) {
                    // For Marathi numbers (०-९), create a wave pattern
                    return Math.sin((asciiCode - 0x0966) * Math.PI / 5); // Creates a wave pattern
                }
                return (255 - asciiCode) / 255;
            } catch (error) {
                console.error('Error in magenta transformation:', error);
                return 0;
            }
        },
        
        yellow: (asciiCode) => {
            try {
                if (conversionConfig.isEnglishNumber(asciiCode)) {
                    // For English numbers (0-9), create a special pattern
                    return Math.cos((asciiCode - 48) * Math.PI / 5); // Creates a cosine wave
                }
                if (conversionConfig.isMarathiNumber(asciiCode)) {
                    // For Marathi numbers (०-९), create a special pattern
                    return Math.cos((asciiCode - 0x0966) * Math.PI / 5); // Creates a cosine wave
                }
                return asciiCode / 255;
            } catch (error) {
                console.error('Error in yellow transformation:', error);
                return 0;
            }
        },
        
        black: (asciiCode) => {
            try {
                if (conversionConfig.isMarathi(asciiCode)) {
                    // For Marathi characters, create a unique pattern
                    return Math.cos((asciiCode - 0x0900) * Math.PI / 128); // Creates a cosine wave
                }
                if (conversionConfig.isEnglishNumber(asciiCode)) {
                    // For English numbers (0-9), create a unique pattern
                    return Math.sin((asciiCode - 48) * Math.PI / 5); // Creates a sine wave
                }
                if (conversionConfig.isMarathiNumber(asciiCode)) {
                    // For Marathi numbers (०-९), create a unique pattern
                    return Math.sin((asciiCode - 0x0966) * Math.PI / 5); // Creates a sine wave
                }
                return (255 - asciiCode) / 255;
            } catch (error) {
                console.error('Error in black transformation:', error);
                return 0;
            }
        }
    }
};

module.exports = conversionConfig; 