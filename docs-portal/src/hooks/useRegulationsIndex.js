/**
 * useRegulationsIndex Hook
 * 
 * Provides a lookup index for regulation metadata from regulations-index.json.
 * Handles format normalization between different ID representations:
 * 
 * | Source              | Format      | Example      |
 * |---------------------|-------------|--------------|
 * | Document slugs      | YYYY-NNNN   | 2025-0848    |
 * | YAML legal refs     | YYYY/NNN    | 2025/848     |
 * | CELEX numbers       | Full format | 32025R0848   |
 * | Shorthand aliases   | Human name  | GDPR, eIDAS  |
 * 
 * IMPORTANT: All YAML files should use YEAR/NUMBER format (e.g., "2014/910").
 * See DEC-225 for the regulation ID standardization decision.
 */

import { useState, useEffect } from 'react';

export function useRegulationsIndex() {
    const [index, setIndex] = useState({});

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/regulations-index.json`)
            .then(res => res.json())
            .then(data => {
                const lookup = {};
                data.forEach(reg => {
                    // Primary lookup: slug format (YYYY-NNNN)
                    lookup[reg.slug] = reg;

                    // YEAR/NUMBER format: "2024/1183" from slug "2024-1183"
                    const idFromSlug = reg.slug.replace('-', '/');
                    lookup[idFromSlug] = reg;

                    // Leading zero normalization:
                    // Slugs use leading zeros (2025-0848) but YAMLs often omit them (2025/848)
                    // This is a format difference between build system and data files, not legacy debt
                    const normalizedId = idFromSlug.replace(/\/0+(\d)/, '/$1');
                    if (normalizedId !== idFromSlug) {
                        lookup[normalizedId] = reg;
                    }

                    // CELEX lookup for external references
                    if (reg.celex) lookup[reg.celex] = reg;
                });

                // Shorthand aliases for common regulations
                // Used when YAML files reference by human-readable name
                const aliases = {
                    'GDPR': '2016-679',           // General Data Protection Regulation
                    'PSD2': '2015-2366',          // Payment Services Directive 2
                    'DORA': '2022-2554',          // Digital Operational Resilience Act
                    'NIS2': '2022-2555',          // Network and Information Security Directive
                    'eIDAS': '2014-910',          // eIDAS Regulation
                    'DSA': '2022-2065',           // Digital Services Act
                    'DMA': '2022-1925',           // Digital Markets Act
                    'AI Act': '2024-1689',        // AI Act
                };
                for (const [alias, slug] of Object.entries(aliases)) {
                    if (lookup[slug]) {
                        lookup[alias] = lookup[slug];
                    }
                }

                setIndex(lookup);
            })
            .catch(console.error);
    }, []);

    return index;
}

export default useRegulationsIndex;
