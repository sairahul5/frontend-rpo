import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ModernNavbar from './components/ModernNavbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import QuestionPapers from './pages/QuestionPapers';
import Portfolio from './pages/Portfolio';
import Solutions from './pages/Solutions';
import AdminPanel from './pages/AdminPanel';
import EditorPanel from './pages/EditorPanel';

const PrivateRoute = ({ children, requireAdmin, requireEditor }) => {
  const { user, isAdmin, isEditor, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" />;
  }

  if (requireEditor && !(isAdmin() || isEditor())) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="app-wrapper">
        <ModernNavbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/question-papers" element={<QuestionPapers />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin={true}>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <PrivateRoute requireEditor={true}>
                <EditorPanel />
              </PrivateRoute>
            }
          />
        </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
