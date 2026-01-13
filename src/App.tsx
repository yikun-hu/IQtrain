import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Header from './components/layouts/Header';
import { Footer } from './components/layouts/Footer';
import { Toaster } from './components/ui/toaster';
import routes from './routes';

const App: React.FC = () => {
  useEffect(() => {
    // console.log(import.meta.env)
  }, [])
  return (
    <Router>
      <LanguageProvider>
        <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, vault: true }}>
          <AuthProvider>
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
          </AuthProvider>
        </PayPalScriptProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
