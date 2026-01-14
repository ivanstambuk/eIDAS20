import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home, Terminology, ImplementingActs, RegulationViewer } from './pages';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="terminology" element={<Terminology />} />
          <Route path="implementing-acts" element={<ImplementingActs />} />

          {/* Document viewers */}
          <Route path="regulation/:id" element={<RegulationViewer />} />
          <Route path="implementing-acts/:id" element={<RegulationViewer />} />
          <Route path="quickstart" element={<PlaceholderPage title="Quick Start Guide" />} />
          <Route path="by-role" element={<PlaceholderPage title="Browse by Role" />} />
          <Route path="cross-references" element={<PlaceholderPage title="Cross-References" />} />
          <Route path="ai-chat" element={<PlaceholderPage title="AI Assistant" />} />
          <Route path="export" element={<PlaceholderPage title="Export" />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

// Temporary placeholder for routes not yet implemented
function PlaceholderPage({ title }) {
  return (
    <div className="animate-fadeIn">
      <h1 style={{ marginBottom: 'var(--space-4)' }}>{title}</h1>
      <div
        className="card"
        style={{
          background: 'var(--bg-tertiary)',
          textAlign: 'center',
          padding: 'var(--space-12)'
        }}
      >
        <p className="text-lg text-muted" style={{ marginBottom: 'var(--space-4)' }}>
          🚧 This page is under construction
        </p>
        <p className="text-sm text-muted">
          This feature will be available in a future update.
        </p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="animate-fadeIn" style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
      <h1 style={{
        fontSize: 'var(--text-4xl)',
        color: 'var(--accent-primary)',
        marginBottom: 'var(--space-4)'
      }}>
        404
      </h1>
      <p className="text-lg text-muted" style={{ marginBottom: 'var(--space-6)' }}>
        Page not found
      </p>
      <a href="/" className="btn btn-primary">
        Go Home
      </a>
    </div>
  );
}

export default App;
