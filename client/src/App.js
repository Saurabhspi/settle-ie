import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import PageTransition from './components/PageTransition';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Assistant from './pages/Assistant';
import Documents from './pages/Documents';
import Community from './pages/Community';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition><Landing /></PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition><Login /></PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition><Register /></PageTransition>
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <PageTransition><Onboarding /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageTransition><Dashboard /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/assistant" element={
          <ProtectedRoute>
            <PageTransition><Assistant /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <PageTransition><Documents /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <PageTransition><Community /></PageTransition>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;