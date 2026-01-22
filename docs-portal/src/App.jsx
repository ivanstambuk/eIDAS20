import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TerminologyProvider } from './components/TermPopover';

// Lazy-loaded pages for code splitting
// These will be loaded on-demand when the route is accessed
const Home = lazy(() => import('./pages/Home'));
const Terminology = lazy(() => import('./pages/Terminology'));
const ImplementingActs = lazy(() => import('./pages/ImplementingActs'));
const RegulationViewer = lazy(() => import('./pages/RegulationViewer'));
const ComplianceAssessment = lazy(() => import('./pages/ComplianceAssessment'));
const VendorQuestionnaire = lazy(() => import('./pages/VendorQuestionnaire'));

// Loading fallback component
function PageLoader() {
  return (
    <div
      className="animate-fadeIn"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 'var(--space-4)'
      }}
    >
      <div className="loading-spinner" />
      <p className="text-muted">Loading...</p>
    </div>
  );
}

function App() {
  return (
    <TerminologyProvider>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="terminology" element={<Terminology />} />
              <Route path="implementing-acts" element={<ImplementingActs />} />
              <Route path="rca" element={<ComplianceAssessment />} />
              <Route path="vcq" element={<VendorQuestionnaire />} />

              {/* Document viewers */}
              <Route path="regulation/:id" element={<RegulationViewer />} />
              <Route path="implementing-acts/:id" element={<RegulationViewer />} />
              <Route path="quickstart" element={<PlaceholderPage title="Quick Start Guide" />} />
              <Route path="by-role" element={<PlaceholderPage title="Browse by Role" />} />
              <Route path="cross-references" element={<PlaceholderPage title="Cross-References" />} />
              <Route path="ai-chat" element={<PlaceholderPage title="AI Assistant" />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </TerminologyProvider>
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
