/**
 * RequirementsTable Component
 * 
 * Sortable table for displaying requirements
 */

import React from 'react';
import './RequirementsTable.css';

function RequirementsTable({
    requirements,
    sourcesConfig,
    sortField,
    sortDirection,
    onSort,
    onRowClick,
}) {
    const getSourceInfo = (sourceId) => {
        return sourcesConfig.sources?.[sourceId] || { name: sourceId, icon: '📄', color: '#666' };
    };

    const getRoleInfo = (roleId) => {
        return sourcesConfig.roles?.[roleId] || { label: roleId, icon: '👤' };
    };

    const getComplianceInfo = (level) => {
        return sourcesConfig.complianceLevels?.[level] || { label: level, color: '#666' };
    };

    const getCriticalityInfo = (level) => {
        return sourcesConfig.criticalities?.[level] || { label: level, color: '#666' };
    };

    const SortHeader = ({ field, label }) => (
        <th
            className={`sortable ${sortField === field ? 'sorted' : ''}`}
            onClick={() => onSort(field)}
        >
            {label}
            <span className="sort-indicator">
                {sortField === field ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
            </span>
        </th>
    );

    const truncate = (text, maxLength = 150) => {
        if (!text || text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    if (requirements.length === 0) {
        return (
            <div className="requirements-table-empty">
                <p>No requirements match the current filters.</p>
            </div>
        );
    }

    return (
        <div className="requirements-table-container">
            <table className="requirements-table">
                <thead>
                    <tr>
                        <SortHeader field="id" label="ID" />
                        <SortHeader field="source" label="Source" />
                        <th>Requirement</th>
                        <SortHeader field="roles" label="Roles" />
                        <SortHeader field="complianceLevel" label="Compliance" />
                        <SortHeader field="criticality" label="Criticality" />
                    </tr>
                </thead>
                <tbody>
                    {requirements.map((req) => {
                        const sourceInfo = getSourceInfo(req.source);
                        const complianceInfo = getComplianceInfo(req.complianceLevel);
                        const criticalityInfo = getCriticalityInfo(req.criticality);

                        return (
                            <tr
                                key={`${req.source}-${req.id}`}
                                onClick={() => onRowClick(req)}
                                className="requirement-row"
                            >
                                <td className="cell-id">
                                    <code>{req.id}</code>
                                </td>
                                <td className="cell-source">
                                    <span
                                        className="source-badge"
                                        style={{ '--source-color': sourceInfo.color }}
                                    >
                                        {sourceInfo.icon} {sourceInfo.shortName || req.source}
                                    </span>
                                </td>
                                <td className="cell-requirement">
                                    {truncate(req.requirement)}
                                </td>
                                <td className="cell-roles">
                                    <div className="role-badges">
                                        {(req.roles || []).slice(0, 3).map(role => {
                                            const roleInfo = getRoleInfo(role);
                                            return (
                                                <span key={role} className="role-badge" title={roleInfo.label}>
                                                    {roleInfo.icon}
                                                </span>
                                            );
                                        })}
                                        {(req.roles || []).length > 3 && (
                                            <span className="role-badge more">
                                                +{req.roles.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="cell-compliance">
                                    <span
                                        className={`compliance-badge ${req.complianceLevel}`}
                                        style={{ '--compliance-color': complianceInfo.color }}
                                    >
                                        {complianceInfo.icon} {complianceInfo.label}
                                    </span>
                                </td>
                                <td className="cell-criticality">
                                    <span
                                        className="criticality-badge"
                                        style={{ backgroundColor: criticalityInfo.color }}
                                    >
                                        {criticalityInfo.label}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default RequirementsTable;
