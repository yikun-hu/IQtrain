import React, { useEffect, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/layouts/Header';
import { Footer } from './components/layouts/Footer';
import routes from './routes';
import { ping } from './db/api';

import { TopRouteLoadingBar } from './components/layouts/TopRouteLoadingBar';

function SuspenseFallback({ onMount }: { onMount?: () => void }) {
  useEffect(() => {
    onMount?.();
  }, [onMount]);
  return <div className="min-h-[40vh]" />; // 你可以放 skeleton
}

const AppWithRouting: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

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
  
  // 切换路由时先“预置打开”，一旦真实页面渲染会关闭（见下方 RouteWrapper）
  useEffect(() => {
    setLoading(true);
  }, [location.pathname]);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />

        {/* Header 下面的条条 */}
        <TopRouteLoadingBar show={loading} />

        <main className="flex-grow">
          <Suspense
            fallback={<SuspenseFallback onMount={() => setLoading(true)} />}
          >
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <RouteLoaded onLoaded={() => setLoading(false)}>
                      {route.element}
                    </RouteLoaded>
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </>
  );
};

// 用于：当路由组件真正渲染成功（chunk加载完成）后，关闭 loading
function RouteLoaded({
  children,
  onLoaded,
}: {
  children: React.ReactNode;
  onLoaded: () => void;
}) {
  useEffect(() => {
    onLoaded();
  }, [onLoaded]);
  return <>{children}</>;
}

const App: React.FC = () => {

  const pingDb = async () => {
    try {
      await ping();
      setTimeout(() => {
        pingDb();
      }, 5000);
    } catch (error) {
      console.error('ping failed:', error);
    }
  }
  useEffect(() => {
    pingDb();
  })
  return (
    <Router>
      <LanguageProvider>
        {/* <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID, vault: true }}> */}
        <AuthProvider>
          <AppWithRouting />
        </AuthProvider>
        {/* </PayPalScriptProvider> */}
      </LanguageProvider>
    </Router>
  );
};

export default App;
