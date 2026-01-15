import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Header from './components/layouts/Header';
import { Footer } from './components/layouts/Footer';
import { Toaster } from './components/ui/toaster';
import routes from './routes';

const AppWithRouting: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Find the route that matches the current location
    const currentRoute = routes.find(route => {
      if (route.path === location.pathname) {
        return true;
      }
      // Handle dynamic routes with parameters like /scale-test/:testType
      if (route.path.includes(':')) {
        const routePathParts = route.path.split('/');
        const currentPathParts = location.pathname.split('/');
        
        if (routePathParts.length === currentPathParts.length) {
          return routePathParts.every((part, index) => 
            part.startsWith(':') || part === currentPathParts[index]
          );
        }
      }
      return false;
    });

    if (currentRoute) {
      document.title = `${currentRoute.name} | IQ Train`;
    } else {
      document.title = 'IQ Train';
    }
  }, [location, routes]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, vault: true }}>
          <AuthProvider>
            <AppWithRouting />
          </AuthProvider>
        </PayPalScriptProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
