# Char2Pixel API Postman Collection

This directory contains Postman collection and environment files for testing the Char2Pixel API.

## Files

- `char2pixel-api.postman_collection.json` - The Postman collection containing all API endpoints
- `char2pixel-api.postman_environment.json` - Environment variables for local development

## How to Import

1. Open Postman
2. Click on "Import" in the top left corner
3. Select both the collection and environment files
4. Click "Import"

## Using the Collection

### Environment Setup

1. After importing, select the "Char2Pixel API - Local" environment from the dropdown in the top right corner
2. You can modify the environment variables if needed:
   - `baseUrl`: The base URL of the API (default: http://localhost:3000)
   - `characterCode`: Default character code for testing (default: 97 for lowercase 'a')
   - `blockName`: Default Unicode block name (default: Devanagari)

### Available Endpoints

The collection includes the following endpoint groups:

1. **Health Check**
   - Simple endpoint to verify the API is running

2. **Convert ASCII to CMYK**
   - Pre-configured examples for common characters:
     - Lowercase 'a' (ASCII 97)
     - Uppercase 'A' (ASCII 65)
     - Number '1' (ASCII 49)
     - Marathi 'अ' (Unicode 0x0905)
   - Custom character endpoint using the `characterCode` variable

3. **Examples**
   - Returns example conversions for different character types

4. **Unicode Blocks**
   - Pre-configured examples for common Unicode blocks:
     - Devanagari
     - Basic Latin
   - Custom block endpoint using the `blockName` variable

## Creating Additional Environments

You can create additional environments for different deployment stages:

1. In Postman, click on the "Environments" tab
2. Click "Add" to create a new environment
3. Add the same variables as in the local environment
4. Update the values for your specific environment (e.g., staging, production)

## Testing Tips

- Use the "Custom Character" request to test any character code
- Use the "Custom Block" request to test any Unicode block
- The collection includes variables that can be updated in the environment settings 