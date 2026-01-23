/**
 * Enhanced YAML parser for portal-specific structures
 * 
 * Handles:
 * - Nested objects (e.g., legalBasis: { regulation, article, paragraph })
 * - Arrays (e.g., roles: [relying_party, wallet_provider])
 * - Multiline strings (with | or > indicators)
 * - Quoted strings
 * 
 * @example
 * const { requirements } = parseSimpleYaml(yamlText);
 * 
 * @note For production with complex YAML, consider using js-yaml library.
 *       This parser is optimized for our specific 2-4 level nested structures.
 */

/**
 * Parse YAML text into a JavaScript object
 * @param {string} text - YAML content
 * @returns {Object} Parsed object with requirements array
 */
export function parseSimpleYaml(text) {
    const result = { requirements: [] };
    let currentReq = null;
    let currentKey = null;
    let currentNestedObj = null;
    let nestedKey = null;
    let multilineValue = [];
    let inMultiline = false;

    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip comments and empty lines at top level
        if (trimmed.startsWith('#') || trimmed === '') {
            if (inMultiline && trimmed === '') {
                multilineValue.push('');
            }
            continue;
        }

        // Handle multiline continuation
        if (inMultiline) {
            if (line.match(/^\s{6,}/) && !trimmed.startsWith('-')) {
                multilineValue.push(trimmed);
                continue;
            } else {
                // End multiline
                if (currentReq && currentKey) {
                    currentReq[currentKey] = multilineValue.join('\n');
                }
                inMultiline = false;
                multilineValue = [];
            }
        }

        // New requirement item (- id: ...)
        if (line.match(/^\s{2}-\s+id:/)) {
            // Save any pending nested object
            if (currentReq && nestedKey && currentNestedObj) {
                currentReq[nestedKey] = currentNestedObj;
                currentNestedObj = null;
                nestedKey = null;
            }
            if (currentReq) {
                result.requirements.push(currentReq);
            }
            currentReq = {};
            const id = line.match(/id:\s*["']?([^"'\n]+)["']?/);
            if (id) currentReq.id = id[1].trim();
            continue;
        }

        // Nested object property (6 spaces: nested key)
        if (currentReq && currentNestedObj && line.match(/^\s{6}\w+:/)) {
            const match = line.match(/^\s{6}(\w+):\s*(.*)/);
            if (match) {
                let value = match[2].trim();
                // Handle quoted strings
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                currentNestedObj[match[1]] = value;
            }
            continue;
        }

        // Requirement properties (4 spaces: key: value)
        if (currentReq && line.match(/^\s{4}\w+:/)) {
            // Save any pending nested object
            if (nestedKey && currentNestedObj && Object.keys(currentNestedObj).length > 0) {
                currentReq[nestedKey] = currentNestedObj;
                currentNestedObj = null;
                nestedKey = null;
            }

            const match = line.match(/^\s{4}(\w+):\s*(.*)/);
            if (match) {
                const key = match[1];
                let value = match[2].trim();
                currentKey = key;

                // Handle multiline indicator
                if (value === '|' || value === '>') {
                    inMultiline = true;
                    multilineValue = [];
                    continue;
                }

                // Handle quoted strings
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }

                // Check if this is a nested object (empty value, next line is 6 spaces with nested key)
                if (value === '') {
                    const nextLine = lines[i + 1];
                    if (nextLine && nextLine.match(/^\s{6}\w+:/)) {
                        // Start nested object
                        currentNestedObj = {};
                        nestedKey = key;
                        continue;
                    }
                    // Check if next lines are array items
                    if (nextLine && nextLine.match(/^\s{6}-/)) {
                        currentReq[key] = [];
                        continue;
                    }
                }

                currentReq[key] = value;
            }
        }

        // Array items (6 spaces: - value)
        if (currentReq && line.match(/^\s{6}-\s/)) {
            const match = line.match(/^\s{6}-\s+(.+)/);
            if (match) {
                // Find the last array in currentReq
                const keys = Object.keys(currentReq);
                for (let j = keys.length - 1; j >= 0; j--) {
                    if (Array.isArray(currentReq[keys[j]])) {
                        currentReq[keys[j]].push(match[1].trim());
                        break;
                    }
                }
            }
        }
    }

    // Save any pending nested object
    if (currentReq && nestedKey && currentNestedObj) {
        currentReq[nestedKey] = currentNestedObj;
    }
    // Add last requirement
    if (currentReq) {
        result.requirements.push(currentReq);
    }

    return result;
}

export default parseSimpleYaml;
