/**
 * RequirementsFilters Component
 * 
 * Multi-dimensional filtering UI for requirements browser
 */

import React from 'react';
import './RequirementsFilters.css';

function RequirementsFilters({
    filters,
    filterOptions,
    sourcesConfig,
    onFilterChange,
    onClearFilters,
    resultCount,
}) {
    const handleSearchChange = (e) => {
        onFilterChange('search', e.target.value);
    };

    const handleCheckboxChange = (filterKey, value) => {
        const current = filters[filterKey] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onFilterChange(filterKey, updated);
    };

    const hasActiveFilters =
        filters.search ||
        filters.sources.length > 0 ||
        filters.roles.length > 0 ||
        filters.categories.length > 0 ||
        (filters.topics && filters.topics.length > 0) ||
        (filters.regulations && filters.regulations.length > 0) ||
        filters.complianceLevels.length > 0 ||
        filters.criticalities.length > 0;

    // Get display info from sourcesConfig
    const getSourceInfo = (sourceId) => {
        return sourcesConfig.sources?.[sourceId] || { name: sourceId, icon: '📄' };
    };

    const getRoleInfo = (roleId) => {
        return sourcesConfig.roles?.[roleId] || { label: roleId, icon: '👤' };
    };

    const getCategoryInfo = (categoryId) => {
        return sourcesConfig.categories?.[categoryId] || { label: categoryId, icon: '📁' };
    };

    const getComplianceInfo = (level) => {
        return sourcesConfig.complianceLevels?.[level] || { label: level, icon: '•' };
    };

    const getCriticalityInfo = (level) => {
        return sourcesConfig.criticalities?.[level] || { label: level };
    };

    return (
        <div className="requirements-filters">
            {/* Search */}
            <div className="filter-search">
                <input
                    type="text"
                    placeholder="🔍 Search requirements..."
                    value={filters.search}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Filter Groups */}
            <div className="filter-groups">
                {/* Source Filter */}
                <div className="filter-group">
                    <h4>Source</h4>
                    <div className="filter-options">
                        {filterOptions.sources.map(source => {
                            const info = getSourceInfo(source);
                            return (
                                <label key={source} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.sources.includes(source)}
                                        onChange={() => handleCheckboxChange('sources', source)}
                                    />
                                    <span className="checkbox-label">
                                        {info.icon} {info.shortName || info.name}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Role Filter */}
                <div className="filter-group">
                    <h4>Role</h4>
                    <div className="filter-options scrollable">
                        {filterOptions.roles.sort().map(role => {
                            const info = getRoleInfo(role);
                            return (
                                <label key={role} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.roles.includes(role)}
                                        onChange={() => handleCheckboxChange('roles', role)}
                                    />
                                    <span className="checkbox-label">
                                        {info.icon} {info.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* ARF Topic Filter */}
                {filterOptions.topics && filterOptions.topics.length > 0 && (
                    <div className="filter-group filter-group-wide">
                        <h4>ARF Topic</h4>
                        <div className="filter-options scrollable">
                            {filterOptions.topics.map(topic => (
                                <label key={topic.number} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={(filters.topics || []).includes(topic.number)}
                                        onChange={() => handleCheckboxChange('topics', topic.number)}
                                    />
                                    <span className="checkbox-label">
                                        <span className="topic-number">#{topic.number}</span>
                                        {topic.title}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category Filter */}
                <div className="filter-group">
                    <h4>Category</h4>
                    <div className="filter-options scrollable">
                        {filterOptions.categories.sort().map(category => {
                            const info = getCategoryInfo(category);
                            return (
                                <label key={category} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category)}
                                        onChange={() => handleCheckboxChange('categories', category)}
                                    />
                                    <span className="checkbox-label">
                                        {info.icon} {info.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Regulation Filter */}
                {filterOptions.regulations && filterOptions.regulations.length > 0 && (
                    <div className="filter-group filter-group-wide">
                        <h4>Legal Basis</h4>
                        <div className="filter-options scrollable">
                            {filterOptions.regulations.map(regId => {
                                // Display-friendly labels for regulation IDs
                                const labels = {
                                    '2014/910': '⚖️ eIDAS (2014/910)',
                                    '2024/1183': '⚖️ eIDAS 2.0 Amendment (2024/1183)',
                                    '2024/2979': '📐 Integrity IA (2024/2979)',
                                    '2024/2980': '📋 TSL IA (2024/2980)',
                                    '2024/2981': '🆔 PID IA (2024/2981)',
                                    '2024/2982': '🔐 Protocols IA (2024/2982)',
                                    '2024/2977': '🔏 LoA IA (2024/2977)',
                                    '2025/846': '🔍 Identity Matching (2025/846)',
                                    '2025/847': '🛡️ Suspension/Withdrawal (2025/847)',
                                    '2025/848': '📝 RP Registration (2025/848)',
                                    '2022/2554': '🏦 DORA (2022/2554)',
                                };
                                const label = labels[regId] || `📄 ${regId}`;
                                return (
                                    <label key={regId} className="filter-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={(filters.regulations || []).includes(regId)}
                                            onChange={() => handleCheckboxChange('regulations', regId)}
                                        />
                                        <span className="checkbox-label">
                                            {label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Compliance Level Filter */}
                <div className="filter-group">
                    <h4>Compliance</h4>
                    <div className="filter-options">
                        {['mandatory', 'recommended', 'optional'].map(level => {
                            if (!filterOptions.complianceLevels.includes(level)) return null;
                            const info = getComplianceInfo(level);
                            return (
                                <label key={level} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.complianceLevels.includes(level)}
                                        onChange={() => handleCheckboxChange('complianceLevels', level)}
                                    />
                                    <span className="checkbox-label">
                                        {info.icon} {info.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Criticality Filter */}
                <div className="filter-group">
                    <h4>Criticality</h4>
                    <div className="filter-options">
                        {['critical', 'high', 'medium', 'low'].map(level => {
                            if (!filterOptions.criticalities.includes(level)) return null;
                            const info = getCriticalityInfo(level);
                            return (
                                <label key={level} className="filter-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={filters.criticalities.includes(level)}
                                        onChange={() => handleCheckboxChange('criticalities', level)}
                                    />
                                    <span
                                        className="checkbox-label"
                                        style={{ '--criticality-color': info.color }}
                                    >
                                        <span
                                            className="criticality-dot"
                                            style={{ backgroundColor: info.color }}
                                        />
                                        {info.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <div className="filter-actions">
                    <button className="clear-filters-btn" onClick={onClearFilters}>
                        ✕ Clear all filters
                    </button>
                    <span className="active-filter-count">
                        {resultCount} results
                    </span>
                </div>
            )}
        </div>
    );
}

export default RequirementsFilters;
