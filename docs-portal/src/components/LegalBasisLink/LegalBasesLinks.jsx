/**
 * LegalBasesLinks Component (DEC-261 Hybrid Approach)
 * 
 * Renders ALL legal bases stacked vertically with compact format.
 * Each article has its own hover popover for details.
 * 
 * Design Decision: Show all legal bases (no overflow) because:
 * - Compliance context requires full visibility of legal anchors
 * - Typical count is 1-3 articles (vertical space is minimal)
 * - ARF HLRs use overflow (+N) since there can be many more
 * 
 * Props:
 * - legalBases: Array of { regulation, article, paragraph, link }
 * - regulationsIndex: lookup object from useRegulationsIndex hook
 */

import { LegalBasisLink } from './LegalBasisLink';
import './LegalBasesLinks.css';

export function LegalBasesLinks({ legalBases, regulationsIndex }) {
    // Handle empty/null input
    if (!legalBases || legalBases.length === 0) return null;

    // Single item - use original component (no numbering needed)
    if (legalBases.length === 1) {
        return <LegalBasisLink legalBasis={legalBases[0]} regulationsIndex={regulationsIndex} />;
    }

    // Multiple items - show ALL stacked vertically with numbering
    return (
        <div className="legal-bases-container legal-bases-stacked">
            {legalBases.map((basis, idx) => (
                <div key={idx} className="legal-bases-row">
                    <span className="legal-bases-number">{idx + 1}.</span>
                    <LegalBasisLink
                        legalBasis={basis}
                        regulationsIndex={regulationsIndex}
                        compact={true}
                    />
                </div>
            ))}
        </div>
    );
}

export default LegalBasesLinks;
