/**
 * RevisionParser.js
 * Parse natural language revision requests in Indonesian
 * 
 * Extracts background color, clothing type, and clothing color from user text.
 */

/**
 * Color mapping from Indonesian to English
 */
const COLOR_MAP = {
  'merah': 'red',
  'biru': 'blue',
  'putih': 'white',
  'hitam': 'black',
  'abu': 'gray',
  'abu-abu': 'gray',
  'hijau': 'green',
  'kuning': 'yellow',
  'coklat': 'brown',
  'pink': 'pink',
  'ungu': 'purple',
  'orange': 'orange',
  'oranye': 'orange',
};

/**
 * Clothing type mapping from Indonesian to English
 */
const CLOTHING_TYPE_MAP = {
  'kemeja': 'formal shirt',
  'hem': 'formal shirt',
  'kaos': 't-shirt',
  'polo': 'polo shirt',
  'jas': 'suit jacket',
  'blazer': 'blazer',
};

/**
 * Normalize color name
 * @param {string} color - Color name in Indonesian
 * @returns {string} Color name in English
 */
function normalizeColor(color) {
  if (!color) return null;
  
  const normalized = color.toLowerCase().trim();
  return COLOR_MAP[normalized] || normalized;
}

/**
 * Normalize clothing type
 * @param {string} type - Clothing type in Indonesian
 * @returns {string} Clothing type in English
 */
function normalizeClothingType(type) {
  if (!type) return null;
  
  const normalized = type.toLowerCase().trim();
  return CLOTHING_TYPE_MAP[normalized] || normalized;
}

/**
 * Parse revision request from user text
 * @param {string} text - User message text
 * @returns {Object} Parsed parameters {background_color, clothing_type, clothing_color}
 */
function parseRevision(text) {
  if (!text) return {};
  
  const updates = {};
  const lowerText = text.toLowerCase();
  
  // Parse background color
  // Patterns: "background merah", "bg biru", "latar putih", "ganti background hijau"
  const bgPatterns = [
    /(?:background|bg|latar)\s+(\w+(?:-\w+)?)/i,
    /ganti\s+(?:background|bg|latar)\s+(\w+(?:-\w+)?)/i,
    /ubah\s+(?:background|bg|latar)\s+(\w+(?:-\w+)?)/i,
  ];
  
  for (const pattern of bgPatterns) {
    const match = text.match(pattern);
    if (match) {
      const color = normalizeColor(match[1]);
      if (color) {
        updates.background_color = color;
        break;
      }
    }
  }
  
  // Parse clothing type
  // Patterns: "pake kemeja", "pakai kaos", "ganti jas"
  const typePatterns = [
    /(?:pake|pakai|ganti|ubah)\s+(kemeja|kaos|polo|jas|blazer|hem)/i,
  ];
  
  for (const pattern of typePatterns) {
    const match = text.match(pattern);
    if (match) {
      const type = normalizeClothingType(match[1]);
      if (type) {
        updates.clothing_type = type;
        break;
      }
    }
  }
  
  // Parse clothing color
  // Patterns: "baju merah", "kemeja hitam", "kaos putih", "ganti baju biru"
  const colorPatterns = [
    /(?:baju|kemeja|kaos|polo|jas|blazer)\s+(\w+(?:-\w+)?)/i,
    /ganti\s+(?:baju|kemeja|kaos)\s+(?:jadi\s+)?(?:kemeja|kaos|polo)?\s*(\w+(?:-\w+)?)/i,
    /ubah\s+(?:baju|kemeja|kaos)\s+(?:jadi\s+)?(?:kemeja|kaos|polo)?\s*(\w+(?:-\w+)?)/i,
  ];
  
  for (const pattern of colorPatterns) {
    const match = text.match(pattern);
    if (match) {
      const color = normalizeColor(match[1]);
      // Make sure it's a color, not a clothing type
      if (color && !CLOTHING_TYPE_MAP[match[1].toLowerCase()]) {
        updates.clothing_color = color;
        break;
      }
    }
  }
  
  logInfo('Parsed revision', { text, updates });
  return updates;
}

/**
 * Validate parsed revision
 * @param {Object} updates - Parsed updates
 * @returns {boolean} True if at least one parameter was parsed
 */
function isValidRevision(updates) {
  return Object.keys(updates).length > 0;
}
