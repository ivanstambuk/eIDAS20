import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { AIChat } from '../AIChat';
import ScrollToTop from '../ScrollToTop';


const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="app-layout">
            {/* Reset scroll position on route changes */}
            <ScrollToTop />

            {/* Skip link for keyboard users - WCAG 2.1 AA */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            <Header onMenuToggle={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

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
