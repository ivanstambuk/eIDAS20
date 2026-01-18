import { useState, useRef, useEffect } from 'react';
import './FilterDropdown.css';

/**
 * Multi-select dropdown filter component (DEC-086)
 * 
 * Features:
 * - Multi-select checkboxes
 * - Active count badge
 * - Glassmorphism styling
 * - Click outside to close
 */
const FilterDropdown = ({
    label,
    options,
    selectedIds,
    onSelectionChange,
    icon = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const activeCount = selectedIds.length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = (optionId) => {
        if (selectedIds.includes(optionId)) {
            onSelectionChange(selectedIds.filter(id => id !== optionId));
        } else {
            onSelectionChange([...selectedIds, optionId]);
        }
    };

    const handleClearAll = () => {
        onSelectionChange([]);
    };

    const handleSelectAll = () => {
        onSelectionChange(options.map(opt => opt.id));
    };

    return (
        <div className="filter-dropdown" ref={dropdownRef}>
            <button
                className={`filter-dropdown-trigger ${isOpen ? 'active' : ''} ${activeCount > 0 ? 'has-selection' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                {icon && <span className="filter-icon">{icon}</span>}
                <span className="filter-label">{label}</span>
                {activeCount > 0 && (
                    <span className="filter-badge">{activeCount}</span>
                )}
                <span className={`filter-chevron ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="filter-dropdown-menu">
                    <div className="filter-dropdown-header">
                        <button
                            className="filter-action-btn"
                            onClick={handleSelectAll}
                        >
                            Select All
                        </button>
                        <button
                            className="filter-action-btn"
                            onClick={handleClearAll}
                            disabled={activeCount === 0}
                        >
                            Clear
                        </button>
                    </div>

                    <div className="filter-dropdown-options" role="listbox">
                        {options.map(option => (
                            <label
                                key={option.id}
                                className={`filter-option ${selectedIds.includes(option.id) ? 'selected' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(option.id)}
                                    onChange={() => handleToggle(option.id)}
                                />
                                {option.icon && (
                                    <span className="option-icon">{option.icon}</span>
                                )}
                                <span className="option-label">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
