import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SedeProvider } from './context/SedeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequiresSede } from './components/RequiresSede';
import { LoginPage } from './pages/LoginPage';
import { ServicesPage } from './pages/ServicesPage';
import { QuotesPage } from './pages/QuotesPage';
import { PendingPage } from './pages/PendingPage';
import { ResourcesManagementPage } from './pages/ResourcesManagementPage';
import { SedesManagementPage } from './pages/SedesManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SedeProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <RequiresSede>
                      <ServicesPage />
                    </RequiresSede>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quotes"
                element={
                  <ProtectedRoute>
                    <RequiresSede>
                      <QuotesPage />
                    </RequiresSede>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pending"
                element={
                  <ProtectedRoute>
                    <RequiresSede>
                      <PendingPage />
                    </RequiresSede>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <RequiresSede>
                      <ResourcesManagementPage />
                    </RequiresSede>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sedes"
                element={
                  <ProtectedRoute>
                    <SedesManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/services" replace />} />
            </Routes>
          </SedeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
