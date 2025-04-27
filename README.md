# Char2Pixel API

A REST API service that provides information about Unicode characters and converts them to pixel representations.

## Features

- Get detailed information about Unicode characters
- Convert characters to pixel representations
- Query characters by Unicode blocks
- Fallback to basic character information when detailed data is not available

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/truepeoplesearch/char2pixel-api.git
cd char2pixel-api
```

2. Install dependencies:
```bash
npm install
```

3. Fetch Unicode data:
```bash
npm run fetch-unicode
```

This will download the Unicode data and create a Parquet file in the `data` directory.

## Usage

Start the API server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### API Endpoints

#### Get Character Information
```
GET /api/char/:code
```
Returns detailed information about a Unicode character.

Example:
```
GET /api/char/0041
```
Response:
```json
{
  "code": 65,
  "character": "A",
  "name": "LATIN CAPITAL LETTER A",
  "block": "Basic Latin",
  "category": "Lu",
  "bidirectional": "L",
  "combining": 0,
  "mirrored": false
}
```

#### Get Block Information
```
GET /api/block/:name
```
Returns all characters in a specific Unicode block.

Example:
```
GET /api/block/Basic Latin
```

## Error Handling

The API includes graceful fallback mechanisms:
- If the Unicode data file is not available, it will still provide basic character information
- Invalid requests return appropriate error messages
- The API logs warnings when detailed data is not available

## License

ISC
