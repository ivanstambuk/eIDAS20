import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { AIChat } from '../AIChat';
import ScrollToTop from '../ScrollToTop';

// Breakpoint must match CSS media query
const DESKTOP_BREAKPOINT = 1025;

const Layout = () => {
    // Mobile: overlay toggle (open/close)
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Desktop: collapse toggle (persisted)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });

    // Persist desktop collapsed state
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', sidebarCollapsed.toString());
    }, [sidebarCollapsed]);

    // Unified toggle: different behavior based on viewport
    const toggleSidebar = () => {
        if (window.innerWidth >= DESKTOP_BREAKPOINT) {
            // Desktop: toggle collapse state
            setSidebarCollapsed(prev => !prev);
        } else {
            // Mobile: toggle overlay
            setSidebarOpen(prev => !prev);
        }
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Reset scroll position on route changes */}
            <ScrollToTop />

            {/* Skip link for keyboard users - WCAG 2.1 AA */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            <Header onMenuToggle={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
            <Sidebar
                isOpen={sidebarOpen}
                isCollapsed={sidebarCollapsed}
                onClose={closeSidebar}
            />

            <main className="main-content" id="main-content" tabIndex={-1}>
                <div className="main-content-inner">
                    <Outlet />
                </div>
            </main>

            {/* Floating AI Chat Widget */}
            <AIChat />
        </div>
    );
};

export default Layout;
