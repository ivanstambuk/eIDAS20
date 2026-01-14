import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { AIChat } from '../AIChat';

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
            <Header onMenuToggle={toggleSidebar} />
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            <main className="main-content">
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
