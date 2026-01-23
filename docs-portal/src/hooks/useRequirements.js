/**
 * useRequirements Hook
 * 
 * Provides unified access to requirements from all sources:
 * - ARF High-Level Requirements
 * - VCQ Requirements
 * - RCA Requirements
 * - Regulatory Requirements
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

// Source metadata
import sourcesConfig from '../../config/requirements/sources.json';

/**
 * @typedef {Object} Requirement
 * @property {string} id - Unique identifier (e.g., "OIA_01", "VEND-CORE-001")
 * @property {string} [harmonizedId] - ARF harmonized ID
 * @property {string} source - Source identifier ("arf-hlr", "vcq", "rca", "regulation")
 * @property {string} requirement - The requirement text
 * @property {string} [explanation] - Additional context
 * @property {string} [notes] - Implementation notes
 * @property {string} category - Category slug
 * @property {string} [part] - ARF part
 * @property {Object} [arfTopic] - ARF topic information
 * @property {number} arfTopic.number - Topic number
 * @property {string} arfTopic.title - Topic title
 * @property {string} [arfTopic.subsection] - Subsection
 * @property {Object} [legalBasis] - Legal basis information
 * @property {string[]} roles - Applicable roles
 * @property {string} complianceLevel - "mandatory" | "recommended" | "optional"
 * @property {string} criticality - "critical" | "high" | "medium" | "low"
 * @property {Object[]} [technicalReferences] - Technical specification references
 * @property {string[]} [linkedRequirements] - IDs of related requirements
 */

/**
 * @typedef {Object} Filters
 * @property {string[]} sources - Selected source IDs
 * @property {string[]} roles - Selected role IDs
 * @property {string[]} categories - Selected category slugs
 * @property {string[]} complianceLevels - Selected compliance levels
 * @property {string[]} criticalities - Selected criticality levels
 * @property {string} search - Search query
 */

const DEFAULT_FILTERS = {
    sources: [],
    roles: [],
    categories: [],
    topics: [],           // ARF topic numbers (e.g., [1, 52])
    regulations: [],      // Legal basis regulation IDs (e.g., ["2014/910", "2024/2979"])
    complianceLevels: [],
    criticalities: [],
    search: '',
};

/**
 * Load ARF HLR requirements
 */
async function loadArfHlr() {
    try {
        const basePath = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${basePath}config/requirements/arf-hlr.json`);
        if (!response.ok) throw new Error('Failed to load ARF HLR');
        const data = await response.json();
        return data.requirements || [];
    } catch (error) {
        console.error('Error loading ARF HLR:', error);
        return [];
    }
}

/**
 * Load VCQ requirements from YAML files
 */
async function loadVcq() {
    const requirements = [];
    const files = ['core', 'ict', 'pif', 'vif'];
    const basePath = import.meta.env.BASE_URL || '/';

    for (const file of files) {
        try {
            const response = await fetch(`${basePath}config/vcq/requirements/${file}.yaml`);
            if (!response.ok) continue;

            const text = await response.text();
            // Simple YAML parsing for our structure
            const parsed = parseSimpleYaml(text);
            if (parsed.requirements) {
                for (const req of parsed.requirements) {
                    requirements.push({
                        ...req,
                        source: 'vcq',
                        complianceLevel: req.complianceLevel ||
                            (req.criticality === 'critical' ? 'mandatory' : 'recommended'),
                    });
                }
            }
        } catch (error) {
            console.warn(`Error loading VCQ ${file}:`, error);
        }
    }

    return requirements;
}

/**
 * Load RCA requirements from role-specific YAML files
 */
async function loadRca() {
    const requirements = [];
    const roleFiles = [
        'relying-party',
        'wallet-provider',
        'pid-provider',
        'issuer',
        'trust-service-provider',
        'conformity-assessment-body',
        'supervisory-body',
    ];
    const basePath = import.meta.env.BASE_URL || '/';

    for (const roleFile of roleFiles) {
        try {
            const response = await fetch(`${basePath}config/rca/requirements/${roleFile}.yaml`);
            if (!response.ok) continue;

            const text = await response.text();
            const parsed = parseSimpleYaml(text);
            if (parsed.requirements) {
                for (const req of parsed.requirements) {
                    // Determine compliance level from bindingType or default to mandatory
                    let complianceLevel = 'mandatory';
                    if (req.bindingType === 'informative') {
                        complianceLevel = 'recommended';
                    } else if (req.bindingType === 'optional') {
                        complianceLevel = 'optional';
                    }

                    // Determine criticality based on category and keywords
                    let criticality = 'high';
                    const lowerReq = (req.requirement || '').toLowerCase();
                    if (req.category === 'security' || lowerReq.includes('security')) {
                        criticality = 'critical';
                    } else if (req.category === 'privacy' || lowerReq.includes('privacy')) {
                        criticality = 'critical';
                    } else if (req.bindingType === 'informative') {
                        criticality = 'medium';
                    }

                    requirements.push({
                        id: req.id,
                        source: 'rca',
                        requirement: req.requirement,
                        explanation: req.explanation,
                        notes: req.notes,
                        category: req.category,
                        roles: req.roles || [],
                        complianceLevel,
                        criticality,
                        legalBasis: req.legalBasis,
                        legalText: req.legalText,
                        deadline: req.deadline,
                        useCases: req.useCases,
                        profileFilter: req.profileFilter,
                    });
                }
            }
        } catch (error) {
            console.warn(`Error loading RCA ${roleFile}:`, error);
        }
    }

    return requirements;
}

/**
 * Enhanced YAML parser for our specific structure
 * Handles nested objects (legalBasis), arrays (roles), and multiline strings
 */
function parseSimpleYaml(text) {
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

/**
 * Main hook
 */
export function useRequirements(initialFilters = DEFAULT_FILTERS) {
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);

    // Load all requirements on mount
    useEffect(() => {
        async function loadAll() {
            setLoading(true);
            setError(null);

            try {
                const [arfHlr, vcq, rca] = await Promise.all([
                    loadArfHlr(),
                    loadVcq(),
                    loadRca(),
                ]);

                setRequirements([...arfHlr, ...vcq, ...rca]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadAll();
    }, []);

    // Apply filters
    const filteredRequirements = useMemo(() => {
        let result = requirements;

        // Filter by source
        if (filters.sources.length > 0) {
            result = result.filter(r => filters.sources.includes(r.source));
        }

        // Filter by role
        if (filters.roles.length > 0) {
            result = result.filter(r =>
                r.roles && r.roles.some(role => filters.roles.includes(role))
            );
        }

        // Filter by category
        if (filters.categories.length > 0) {
            result = result.filter(r => filters.categories.includes(r.category));
        }

        // Filter by ARF topic
        if (filters.topics && filters.topics.length > 0) {
            result = result.filter(r =>
                r.arfTopic && filters.topics.includes(String(r.arfTopic.number))
            );
        }

        // Filter by regulation (legal basis)
        if (filters.regulations && filters.regulations.length > 0) {
            result = result.filter(r =>
                r.legalBasis && filters.regulations.includes(r.legalBasis.regulation)
            );
        }

        // Filter by compliance level
        if (filters.complianceLevels.length > 0) {
            result = result.filter(r => filters.complianceLevels.includes(r.complianceLevel));
        }

        // Filter by criticality
        if (filters.criticalities.length > 0) {
            result = result.filter(r => filters.criticalities.includes(r.criticality));
        }

        // Filter by search
        if (filters.search.trim()) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(r => {
                const searchFields = [
                    r.id,
                    r.harmonizedId,
                    r.requirement,
                    r.notes,
                    r.category,
                    ...(r.roles || []),
                ].filter(Boolean).join(' ').toLowerCase();

                return searchFields.includes(searchLower);
            });
        }

        return result;
    }, [requirements, filters]);

    // Update individual filter
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const sources = new Set();
        const roles = new Set();
        const categories = new Set();
        const topics = new Map(); // Map topic number -> title
        const regulations = new Set(); // Regulation IDs from legalBasis
        const complianceLevels = new Set();
        const criticalities = new Set();

        for (const req of requirements) {
            sources.add(req.source);
            if (req.roles) req.roles.forEach(r => roles.add(r));
            if (req.category) categories.add(req.category);
            if (req.arfTopic) {
                topics.set(String(req.arfTopic.number), req.arfTopic.title);
            }
            if (req.legalBasis && req.legalBasis.regulation) {
                regulations.add(req.legalBasis.regulation);
            }
            if (req.complianceLevel) complianceLevels.add(req.complianceLevel);
            if (req.criticality) criticalities.add(req.criticality);
        }

        // Convert topics map to sorted array of {number, title}
        const sortedTopics = Array.from(topics.entries())
            .map(([number, title]) => ({ number, title }))
            .sort((a, b) => parseInt(a.number) - parseInt(b.number));

        return {
            sources: Array.from(sources),
            roles: Array.from(roles),
            categories: Array.from(categories),
            topics: sortedTopics,
            regulations: Array.from(regulations).sort(),
            complianceLevels: Array.from(complianceLevels),
            criticalities: Array.from(criticalities),
        };
    }, [requirements]);

    // Statistics
    const stats = useMemo(() => ({
        total: requirements.length,
        filtered: filteredRequirements.length,
        bySource: requirements.reduce((acc, r) => {
            acc[r.source] = (acc[r.source] || 0) + 1;
            return acc;
        }, {}),
    }), [requirements, filteredRequirements]);

    return {
        requirements: filteredRequirements,
        allRequirements: requirements,
        loading,
        error,
        filters,
        setFilters,      // Expose for URL-based initialization
        updateFilter,
        clearFilters,
        filterOptions,
        stats,
        sourcesConfig,
    };
}

export default useRequirements;
